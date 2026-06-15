export const prerender = false;

import { Resend } from 'resend';
import { z } from 'zod';
import type { APIRoute } from 'astro';
import xss from 'xss';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

// Système de Rate Limiting en mémoire (bloque après 5 essais)
const rateLimit = new Map<string, { count: number, timestamp: number }>();
const LIMIT = 5; 
const WINDOW_MS = 60 * 60 * 1000; // Fenêtre de 1 heure

// Schéma de validation Zod hyper strict
const contactSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .refine(val => !/[<>"'&]/.test(val), 'Le nom contient des caractères non autorisés'),
  email: z.string()
    .email('Adresse email invalide')
    .refine(val => !/[<>"'&]/.test(val), 'L\'email contient des caractères non autorisés'),
  phone: z.string()
    .optional()
    .refine(val => !val || !/[<>"'&]/.test(val), 'Le téléphone contient des caractères non autorisés'),
  message: z.string()
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(1000, 'Le message ne peut pas dépasser 1000 caractères')
    .refine(val => !/[<>"'&]/.test(val), 'Le message contient des caractères non autorisés')
});

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    // 1. RATE LIMITING (Basé sur l'IP)
    const ip = request.headers.get('x-forwarded-for') || clientAddress || 'unknown-ip';
    const now = Date.now();
    const userLimit = rateLimit.get(ip);

    if (userLimit && now - userLimit.timestamp < WINDOW_MS) {
      if (userLimit.count >= LIMIT) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'Trop de requêtes. Veuillez réessayer plus tard.' 
        }), { 
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      userLimit.count++;
    } else {
      rateLimit.set(ip, { count: 1, timestamp: now });
    }

    // 2. PARSING ET VALIDATION ZOD
    const body = await request.json();
    const result = contactSchema.safeParse(body);
    
    if (!result.success) {
      return new Response(JSON.stringify({ 
        success: false,
        errors: result.error.issues.map(issue => issue.message)
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 3. SANITIZATION (Nettoyage anti-XSS)
    const sanitizedData = {
      name: xss(result.data.name),
      email: xss(result.data.email),
      phone: result.data.phone ? xss(result.data.phone) : undefined,
      message: xss(result.data.message)
    };
    
    // 4. ENVOI DE L'EMAIL VIA RESEND
    await resend.emails.send({
      from: 'CLICOM <noreply@clicom.ch>', // Assurez-vous que ce domaine est vérifié
      to: ['ms@clicom.ch'],
      subject: `Nouveau message de ${sanitizedData.name}`,
      text: `Nom: ${sanitizedData.name}\nEmail: ${sanitizedData.email}\nTéléphone: ${sanitizedData.phone || 'Non fourni'}\nMessage: ${sanitizedData.message}`,
    });

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Erreur serveur interne' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};