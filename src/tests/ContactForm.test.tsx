import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactFormReact from '../components/ui/ContactFormReact';

// Mock pour la fonction fetch utilisée dans le formulaire
global.fetch = vi.fn().mockResolvedValue({ ok: true });

// Fonction utilitaire pour remplir le formulaire
const fillValidForm = () => {
  fireEvent.change(screen.getByLabelText(/nom/i), { target: { value: 'Jean Dupont' } });
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jean.dupont@example.com' } });
  fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Ceci est un message de test' } });
};

describe('ContactForm', () => {
  it('affiche les erreurs de validation pour les champs vides', async () => {
    render(<ContactFormReact />);
    const submitButton = screen.getByRole('button', { name: /envoyer/i });
    
    // Ajout de await pour l'événement de soumission
    await fireEvent.click(submitButton);
    
    expect(await screen.findByText('Le nom est requis')).toBeInTheDocument();
    expect(await screen.findByText('L\'email est requis')).toBeInTheDocument();
    expect(await screen.findByText('Le message est requis')).toBeInTheDocument();
  });

  it('simule un succès sans appeler l\'API lorsque le champ Honeypot est rempli', async () => {
    render(<ContactFormReact />);
    
    // Remplir le champ Honeypot (bot-field)
    const botField = screen.getByLabelText('Ne pas remplir ce champ si vous êtes humain', { selector: 'input' });
    fireEvent.change(botField, { target: { value: 'bot detected' } });
    
    // Remplir les autres champs avec des données valides
    fillValidForm();
    
    fireEvent.click(screen.getByRole('button', { name: /envoyer/i }));
    
    // Vérifier que le message de succès s'affiche immédiatement
    expect(await screen.findByText('Message envoyé avec succès ! Je vous recontacte rapidement.')).toBeInTheDocument();
    
    // Vérifier que fetch n'a pas été appelé
    expect(fetch).not.toHaveBeenCalled();
  });

  it('affiche une erreur pour un email invalide', async () => {
    render(<ContactFormReact />);
    
    // Remplir uniquement l'email invalide
    const emailInput = screen.getByLabelText(/adresse email \*/i);
    fireEvent.change(emailInput, { target: { value: 'email-invalide' } });
    
    // Soumettre le formulaire avec await
    await fireEvent.click(screen.getByRole('button', { name: /envoyer/i }));
    
    // Utilisation de findByText pour attendre l'apparition du message
    expect(await screen.findByText(/email invalide/i)).toBeInTheDocument();
  });

  it('affiche les erreurs de validation avec la nouvelle structure Zod', async () => {
    render(<ContactFormReact />);
    const submitButton = screen.getByRole('button', { name: /envoyer/i });
    
    // Ajout de await pour l'événement de soumission
    await fireEvent.click(submitButton);
    
    // Remplacer waitFor/getByText par findByText
    expect(await screen.findByText('Le nom est requis')).toBeInTheDocument();
    expect(await screen.findByText('L\'email est requis')).toBeInTheDocument();
    expect(await screen.findByText('Le message est requis')).toBeInTheDocument();
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