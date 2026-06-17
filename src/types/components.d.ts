// src/types/components.d.ts
// Typage strict partagé entre les composants React et les routes API
// Aucun `any` autorisé — chaque type est explicite

// ─── Navigation ───────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href:  string;
  icon?: string;
}

export interface HeaderProps {
  title?:      string;
  navigation?: NavItem[];
}

// ─── Formulaire de contact ────────────────────────────────────────────────────

/** Données brutes saisies par l'utilisateur dans le formulaire */
export interface ContactFormData {
  name:     string;
  email:    string;
  phone:    string;
  message:  string;
  honeypot: string;
}

/** Erreurs de validation champ par champ (frontend + backend) */
export interface ContactFormErrors {
  name?:    string;
  email?:   string;
  phone?:   string;
  message?: string;
  submit?:  string;
}

/** Props exposées par ContactFormReact */
export interface ContactFormProps {
  onSuccess?:  () => void;
  onError?:    (error: string) => void;
  className?:  string;
  /** Texte du bouton de soumission */
  submitText?: string;
}

/** Réponse standard de la route /api/contact */
export interface ApiContactResponse {
  success:  boolean;
  message?: string;
  /** Tableau de messages d'erreur Zod en cas d'échec de validation */
  errors?:  string[];
}

// ─── Chatbot ──────────────────────────────────────────────────────────────────

export type ChatbotSender = 'user' | 'bot';

export interface ChatbotMessage {
  id:        string;
  text:      string;
  sender:    ChatbotSender;
  timestamp: number;
}

export interface ChatbotProps {
  /** Position du bouton flottant */
  position?: 'bottom-right' | 'bottom-left';
  /** Message d'accueil initial */
  greeting?: string;
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// ─── Module Astro (déclaration de type pour les imports .astro) ───────────────

declare module '*.astro' {
  import type { AstroComponentFactory } from 'astro/dist/runtime/server';
  const component: AstroComponentFactory;
  export default component;
}