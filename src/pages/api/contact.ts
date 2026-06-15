export const prerender = false;

import { Resend } from 'resend';
import { z } from 'zod';
import type { APIRoute } from 'astro';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

const contactSchema = z.object({
  name: z.string().min(2).max(50).refine(val => !/[<>]/.test(val)),
  email: z.string().email().refine(val => !/[<>]/.test(val)),
  phone: z.string().optional().refine(val => !val || !/[<>]/.test(val)),
  message: z.string().min(10).max(1000).refine(val => !/[<>]/.test(val))
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const result = contactSchema.safeParse(body);
    
    if (!result.success) {
      return new Response(JSON.stringify({ success: false }), { status: 400 });
    }
    
    const { name, email, phone, message } = result.data;
    
    await resend.emails.send({
      from: 'CLICOM <noreply@clicom.ch>',
      to: ['ms@clicom.ch'],
      subject: `Nouveau message de ${name}`,
      text: `Nom: ${name}\nEmail: ${email}\nTéléphone: ${phone || 'Non fourni'}\nMessage: ${message}`,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: 'Erreur' }), { status: 500 });
  }
};