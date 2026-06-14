import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ContactFormReact from '../components/ui/ContactFormReact';

// Mock pour la fonction fetch utilisée dans le formulaire
global.fetch = vi.fn().mockResolvedValue({ ok: true });

describe('ContactForm', () => {
  it('affiche les erreurs de validation pour les champs vides', async () => {
    render(<ContactFormReact />);
    const submitButton = screen.getByRole('button', { name: /envoyer/i });
    
    fireEvent.click(submitButton);
    
    expect(await screen.findByText('Le nom est requis')).toBeInTheDocument();
    expect(await screen.findByText('L\'email est requis')).toBeInTheDocument();
    expect(await screen.findByText('Le message est requis')).toBeInTheDocument();
  });

  it('affiche une erreur pour un email invalide', async () => {
    render(<ContactFormReact />);
    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: 'Envoyer' });
    
    fireEvent.change(emailInput, { target: { value: 'email-invalide' } });
    fireEvent.click(submitButton);
    
    expect(await screen.findByText('Email invalide')).toBeInTheDocument();
  });

  it('soumet avec succès lorsque les données sont valides', async () => {
    render(<ContactFormReact />);
    const nameInput = screen.getByLabelText(/nom/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);
    const submitButton = screen.getByRole('button', { name: /envoyer/i });
    
    fireEvent.change(nameInput, { target: { value: 'Jean Dupont' } });
    fireEvent.change(emailInput, { target: { value: 'jean.dupont@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'Ceci est un message de test' } });
    fireEvent.click(submitButton);
    
    // Vérifier que fetch a été appelé avec les bonnes données
    expect(fetch).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      body: JSON.stringify({
        name: 'Jean Dupont',
        email: 'jean.dupont@example.com',
        message: 'Ceci est un message de test'
      })
    }));
  });
});