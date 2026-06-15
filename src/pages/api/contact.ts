import { Resend } from 'resend';
import { z } from 'zod';
import type { APIRoute } from 'astro';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

// Schéma de validation Zod avec protection XSS
const contactSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .refine(val => !/[<>]/.test(val), 'Le nom contient des caractères non autorisés'),
  email: z.string()
    .email('Adresse email invalide')
    .refine(val => !/[<>]/.test(val), 'L\'email contient des caractères non autorisés'),
  phone: z.string()
    .optional()
    .refine(val => !val || !/[<>]/.test(val), 'Le téléphone contient des caractères non autorisés'),
  message: z.string()
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(1000, 'Le message ne peut pas dépasser 1000 caractères')
    .refine(val => !/[<>]/.test(val), 'Le message contient des caractères non autorisés')
});

export const post: APIRoute = async ({ request }) => {
  try {
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
    
    const { name, email, phone, message } = result.data;
    
    await resend.emails.send({
      from: 'CLICOM <noreply@clicom.ch>',
      to: ['ms@clicom.ch'],
      subject: `Nouveau message de ${name}`,
      text: `Nom: ${name}\nEmail: ${email}\nTéléphone: ${phone || 'Non fourni'}\nMessage: ${message}`,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Erreur serveur' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};