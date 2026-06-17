export const prerender = false;

import { Resend } from 'resend';
import { z } from 'zod';
import type { APIRoute } from 'astro';
import xss from 'xss';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

// --- ÉTATS EN MÉMOIRE (⚠️ Réinitialisés au cold start serverless) ---
// Pour la production avec Vercel/Netlify, utilisez @upstash/ratelimit
const rateLimit = new Map<string, { count: number; timestamp: number; lastReqTimestamp: number }>();
const duplicateCheck = new Map<string, number>(); // Signature email+message -> timestamp

// --- CONSTANTES DE SÉCURITÉ ---
const LIMIT = 5; // Nombre max de requêtes
const WINDOW_MS = 60 * 60 * 1000; // Fenêtre de 1 heure
const MIN_DELAY_MS = 2000; // 2 secondes minimum entre 2 requêtes
const DUPLICATE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes anti-doublon
const MAX_BODY_SIZE = 1024 * 10; // 10KB max pour le body
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // Nettoyage des Maps toutes les heures

// --- DOMAINES JETABLES (Anti-spam) ---
const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'throwaway.email',
  'mailinator.com',
  'yopmail.com',
  'temp-mail.org',
  '33mail.com',
  'getnada.com',
  'spambox.us',
  // Ajoutez d'autres domaines si nécessaire
]);

// --- CONFIGURATION CORS ---
const ALLOWED_ORIGINS = [
  'https://clicom.ch',
  'https://www.clicom.ch',
  // Ajoutez vos autres domaines en production
  'http://localhost:4321', // Pour le développement
];

const getCorsHeaders = (origin: string | null) => {
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400', // Cache preflight 24h
  };
};

// --- NETTOYAGE AUTOMATIQUE DES MAPS ---
const cleanupMaps = () => {
  const now = Date.now();
  
  // Nettoyer rateLimit
  for (const [ip, data] of rateLimit) {
    if (now - data.timestamp > WINDOW_MS) {
      rateLimit.delete(ip);
    }
  }
  
  // Nettoyer duplicateCheck
  for (const [key, timestamp] of duplicateCheck) {
    if (now - timestamp > DUPLICATE_WINDOW_MS) {
      duplicateCheck.delete(key);
    }
  }
};

// Lancer le nettoyage périodique
setInterval(cleanupMaps, CLEANUP_INTERVAL_MS);

// --- FONCTION UTILITAIRE DE RÉPONSE ---
const buildResponse = (body: object, status: number, origin: string | null = null) => {
  const headers = getCorsHeaders(origin);
  return new Response(JSON.stringify(body), { status, headers });
};

// --- SCHÉMA DE VALIDATION ZOD ---
const contactSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .regex(/^[\p{L}\p{M}\s\-']+$/u, 'Le nom contient des caractères invalides'),
  
  email: z.string()
    .trim()
    .toLowerCase()
    .email('Adresse email invalide')
    .max(100, 'Email trop long'),
  
  phone: z.string()
    .trim()
    .max(20, 'Numéro de téléphone trop long')
    .regex(/^[0-9+\-\s()]*$/, 'Format de téléphone invalide')
    .optional()
    .default(''),
  
  message: z.string()
    .trim()
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(1000, 'Le message ne peut pas dépasser 1000 caractères'),
  
  honeypot: z.string()
    .max(0, 'Champ invalide')
    .optional()
    .default(''),
});

// --- LOGGEMENT STRUCTURÉ ---
const logSecurity = (level: 'info' | 'warn' | 'error', message: string, data: Record<string, any> = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    service: 'contact-api',
    message,
    ...data,
  };
  
  if (level === 'error') console.error(JSON.stringify(logEntry));
  else if (level === 'warn') console.warn(JSON.stringify(logEntry));
  else console.log(JSON.stringify(logEntry));
};

// --- GESTION DU PREFLIGHT CORS (OPTIONS) ---
export const OPTIONS: APIRoute = async ({ request }) => {
  const origin = request.headers.get('origin');
  const headers = getCorsHeaders(origin);
  return new Response(null, { status: 204, headers });
};

// --- ROUTE POST PRINCIPALE ---
export const POST: APIRoute = async ({ request, clientAddress }) => {
  const origin = request.headers.get('origin');
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || clientAddress 
    || 'unknown-ip';
  
  const now = Date.now();
  
  try {
    // --- 1. VALIDATION DE LA TAILLE DU BODY ---
    const rawBody = await request.text();
    if (rawBody.length > MAX_BODY_SIZE) {
      logSecurity('warn', 'Body trop volumineux', { ip, size: rawBody.length });
      return buildResponse({ 
        success: false, 
        message: 'Requête trop volumineuse' 
      }, 413, origin);
    }

    // --- 2. RATE LIMITING & ANTI-RAFALE ---
    const userLimit = rateLimit.get(ip);
    
    if (userLimit) {
      // Vérification du délai minimum entre les requêtes
      if (now - userLimit.lastReqTimestamp < MIN_DELAY_MS) {
        logSecurity('warn', 'Rafale détectée', { ip, delay: now - userLimit.lastReqTimestamp });
        return buildResponse({ 
          success: false, 
          message: 'Veuillez patienter entre vos requêtes.' 
        }, 429, origin);
      }

      // Vérification du quota horaire
      if (now - userLimit.timestamp < WINDOW_MS) {
        if (userLimit.count >= LIMIT) {
          logSecurity('warn', 'Quota horaire dépassé', { ip, count: userLimit.count });
          return buildResponse({ 
            success: false, 
            message: 'Trop de requêtes. Veuillez réessayer plus tard.' 
          }, 429, origin);
        }
        userLimit.count++;
        userLimit.lastReqTimestamp = now;
      } else {
        // Réinitialisation de la fenêtre
        rateLimit.set(ip, { count: 1, timestamp: now, lastReqTimestamp: now });
      }
    } else {
      rateLimit.set(ip, { count: 1, timestamp: now, lastReqTimestamp: now });
    }

    // --- 3. PARSING ET VALIDATION ---
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      logSecurity('warn', 'JSON malformé', { ip });
      return buildResponse({ 
        success: false, 
        message: 'Format de données invalide' 
      }, 400, origin);
    }

    const result = contactSchema.safeParse(body);
    
    if (!result.success) {
      const errors = result.error.issues.map(i => i.message);
      logSecurity('info', 'Validation échouée', { ip, errors });
      return buildResponse({ 
        success: false, 
        errors 
      }, 400, origin);
    }

    // --- 4. HONEYPOT (Anti-bot) ---
    if (result.data.honeypot && result.data.honeypot.length > 0) {
      logSecurity('warn', 'Bot détecté (honeypot)', { ip });
      // Faux succès pour tromper le bot
      return buildResponse({ 
        success: true, 
        message: 'Message envoyé.' 
      }, 200, origin);
    }

    // --- 5. SANITIZATION ---
    const sanitizedData = {
      name: xss(result.data.name),
      email: xss(result.data.email),
      phone: result.data.phone ? xss(result.data.phone) : 'Non fourni',
      message: xss(result.data.message),
    };

    // --- 6. VÉRIFICATION DES DOMAINES JETABLES ---
    const emailDomain = sanitizedData.email.split('@')[1];
    if (DISPOSABLE_DOMAINS.has(emailDomain)) {
      logSecurity('warn', 'Email jetable détecté', { ip, email: sanitizedData.email });
      // Faux succès pour ne pas alerter l'attaquant
      return buildResponse({ 
        success: true, 
        message: 'Message envoyé.' 
      }, 200, origin);
    }

    // --- 7. PROTECTION ANTI-DOUBLONS ---
    const signature = `${sanitizedData.email}|${sanitizedData.message}`;
    const lastSent = duplicateCheck.get(signature);

    if (lastSent && (now - lastSent < DUPLICATE_WINDOW_MS)) {
      logSecurity('warn', 'Doublon détecté', { ip, email: sanitizedData.email });
      // Faux succès pour éviter le spam
      return buildResponse({ 
        success: true, 
        message: 'Message en cours de traitement.' 
      }, 200, origin);
    }
    duplicateCheck.set(signature, now);

    // --- 8. ENVOI DE L'EMAIL VIA RESEND ---
    const { error } = await resend.emails.send({
      from: 'CLICOM <noreply@clicom.ch>',
      to: ['ms@clicom.ch'],
      reply_to: sanitizedData.email,
      subject: `Nouveau message de ${sanitizedData.name}`,
      text: `
Nom: ${sanitizedData.name}
Email: ${sanitizedData.email}
Téléphone: ${sanitizedData.phone}
IP: ${ip}

Message:
${sanitizedData.message}
      `.trim(),
    });

    if (error) {
      logSecurity('error', 'Erreur Resend API', { ip, error: error.message });
      return buildResponse({ 
        success: false, 
        message: 'Le service de messagerie est temporairement indisponible.' 
      }, 502, origin);
    }

    // --- 9. SUCCÈS ---
    logSecurity('info', 'Message envoyé avec succès', { 
      ip, 
      email: sanitizedData.email,
      name: sanitizedData.name 
    });

    return buildResponse({ 
      success: true,
      message: 'Votre message a été envoyé avec succès.' 
    }, 200, origin);

  } catch (error) {
    // Erreur inattendue
    logSecurity('error', 'Erreur serveur interne', { 
      ip, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    return buildResponse({ 
      success: false, 
      message: 'Une erreur inattendue est survenue.' 
    }, 500, origin);
  }
};