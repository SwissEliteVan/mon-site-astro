import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const post: APIRoute = async ({ request }) => {
  // Utilisation de Resend comme service d'email (à configurer avec les secrets)
  const resend = new Resend(import.meta.env.RESEND_API_KEY);
  
  try {
    const data = await request.json();
    
    await resend.emails.send({
      from: 'site@clicom.ch',
      to: 'hello@clicom.ch',
      subject: `Nouveau message de ${data.name}`,
      text: data.message,
      reply_to: data.email
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};