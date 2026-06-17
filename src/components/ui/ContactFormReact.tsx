import React, { useState, useRef, useCallback, useId } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import type {
  ContactFormProps,
  ContactFormData,
  ContactFormErrors,
  ApiContactResponse,
} from '../types/components';

// ─────────────────────────────────────────────────────────────────────────────
// DONNÉES INITIALES
// ─────────────────────────────────────────────────────────────────────────────
const INITIAL_DATA: ContactFormData = {
  name:     '',
  email:    '',
  phone:    '',
  message:  '',
  honeypot: '',
};

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION FRONT-END (miroir exact du schéma Zod du backend)
// ─────────────────────────────────────────────────────────────────────────────
function validate(data: ContactFormData): ContactFormErrors {
  const errors: ContactFormErrors = {};

  if (!data.name.trim()) {
    errors.name = 'Le nom est requis';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Le nom doit contenir au moins 2 caractères';
  } else if (data.name.trim().length > 50) {
    errors.name = 'Le nom ne peut pas dépasser 50 caractères';
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!data.email.trim()) {
    errors.email = "L'email est requis";
  } else if (!emailRegex.test(data.email.trim())) {
    errors.email = 'Adresse email invalide';
  }

  if (data.phone.trim()) {
    const phoneRegex = /^[0-9+\-\s()]{8,20}$/;
    if (!phoneRegex.test(data.phone.trim())) {
      errors.phone = 'Format de téléphone invalide';
    }
  }

  if (!data.message.trim()) {
    errors.message = 'Le message est requis';
  } else if (data.message.trim().length < 10) {
    errors.message = 'Le message doit contenir au moins 10 caractères';
  } else if (data.message.trim().length > 1000) {
    errors.message = 'Le message ne peut pas dépasser 1000 caractères';
  }

  return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
// SOUS-COMPOSANT : Champ avec icône
// ─────────────────────────────────────────────────────────────────────────────
interface FieldProps {
  id:            string;
  label:         string;
  required?:     boolean;
  error?:        string;
  errorId:       string;
  children:      React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, required, error, errorId, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-400">
      {label}
      {required && <span className="text-lime ml-1" aria-hidden="true">*</span>}
    </label>
    {children}
    {error && (
      <span id={errorId} className="text-xs text-red-400 font-medium" role="alert">
        {error}
      </span>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
const ContactFormReact: React.FC<ContactFormProps> = ({
  onSuccess,
  onError,
  className = '',
  submitText = 'Envoyer le message',
}) => {
  const uid                                          = useId();
  const [formData, setFormData]                      = useState<ContactFormData>(INITIAL_DATA);
  const [errors, setErrors]                          = useState<ContactFormErrors>({});
  const [loading, setLoading]                        = useState<boolean>(false);
  const [success, setSuccess]                        = useState<boolean>(false);
  const resetTimerRef                                = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Nettoyage du timer de réinitialisation au démontage
  React.useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  // Mise à jour d'un champ + suppression de l'erreur associée
  const handleChange = useCallback(
    (field: keyof ContactFormData) =>
      (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field as keyof ContactFormErrors]) {
          setErrors(prev => ({ ...prev, [field]: undefined }));
        }
      },
    [errors],
  );

  const handleReset = useCallback(() => {
    setSuccess(false);
    setFormData(INITIAL_DATA);
    setErrors({});
  }, []);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Honeypot front-end : on simule un succès sans appeler l'API
    if (formData.honeypot) {
      setSuccess(true);
      onSuccess?.();
      return;
    }

    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll vers le premier champ en erreur
      const firstErrorEl = document.querySelector<HTMLElement>('[aria-invalid="true"]');
      firstErrorEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstErrorEl?.focus({ preventScroll: true });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:     formData.name.trim(),
          email:    formData.email.trim().toLowerCase(),
          phone:    formData.phone.trim(),
          message:  formData.message.trim(),
          honeypot: formData.honeypot,
        } satisfies ContactFormData),
      });

      const data: ApiContactResponse = await response.json() as ApiContactResponse;

      if (response.ok && data.success) {
        setSuccess(true);
        setFormData(INITIAL_DATA);
        setErrors({});
        onSuccess?.();
        // Auto-reset du message de succès après 10 secondes
        resetTimerRef.current = setTimeout(() => setSuccess(false), 10_000);
      } else {
        // Erreurs de validation Zod retournées par le backend
        if (data.errors && data.errors.length > 0) {
          const backendErrors: ContactFormErrors = {};
          data.errors.forEach((msg: string) => {
            const lower = msg.toLowerCase();
            if (lower.includes('nom'))                                    backendErrors.name    = msg;
            else if (lower.includes('email') || lower.includes('adresse')) backendErrors.email   = msg;
            else if (lower.includes('téléphone') || lower.includes('phone')) backendErrors.phone = msg;
            else if (lower.includes('message'))                            backendErrors.message = msg;
            else                                                           backendErrors.submit  = msg;
          });
          setErrors(backendErrors);
        } else {
          throw new Error(data.message ?? "Erreur lors de l'envoi");
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Le serveur ne répond pas. Veuillez réessayer.';
      setErrors({ submit: message });
      onError?.(message);
    } finally {
      setLoading(false);
    }
  }, [formData, onSuccess, onError]);

  // Classes réutilisables
  const inputBase =
    'w-full bg-brand-dark border rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const inputNormal  = `${inputBase} border-border focus:border-lime/60 focus:ring-1 focus:ring-lime/30`;
  const inputError   = `${inputBase} border-red-500/60 focus:border-red-500 focus:ring-1 focus:ring-red-500/30`;

  if (success) {
    return (
      <div className={`flex flex-col items-center justify-center gap-6 py-16 text-center ${className}`} role="status" aria-live="polite">
        <div className="w-16 h-16 rounded-full bg-lime/10 border border-lime/30 flex items-center justify-center">
          <svg className="w-8 h-8 text-lime" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-xl font-bold text-white mb-2">Message envoyé !</p>
          <p className="text-gray-400 text-sm">Je vous recontacte sous 24h ouvrées.</p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-sm text-lime hover:text-lime-hover underline underline-offset-4 transition-colors"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form
      className={`flex flex-col gap-5 ${className}`}
      onSubmit={handleSubmit}
      noValidate
      aria-label="Formulaire de contact CLICOM"
    >
      {/* Erreur globale de soumission */}
      {errors.submit && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3.5 rounded-xl" role="alert" aria-live="assertive">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{errors.submit}</span>
        </div>
      )}

      {/* ── HONEYPOT (invisible aux humains, détecte les bots) ── */}
      <div
        style={{ position: 'absolute', left: '-9999px', top: '-9999px', opacity: 0, pointerEvents: 'none' }}
        aria-hidden="true"
        tabIndex={-1}
      >
        <label htmlFor={`${uid}-honeypot`}>Ne pas remplir ce champ</label>
        <input
          id={`${uid}-honeypot`}
          type="text"
          name="honeypot"
          value={formData.honeypot}
          onChange={handleChange('honeypot')}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* ── Nom + Email (grille 2 colonnes sur md+) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field
          id={`${uid}-name`}
          label="Nom complet"
          required
          error={errors.name}
          errorId={`${uid}-name-error`}
        >
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" aria-hidden="true">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </span>
            <input
              id={`${uid}-name`}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange('name')}
              className={`${errors.name ? inputError : inputNormal} pl-10`}
              placeholder="Votre nom complet"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? `${uid}-name-error` : undefined}
              disabled={loading}
              autoComplete="name"
            />
          </div>
        </Field>

        <Field
          id={`${uid}-email`}
          label="Adresse email"
          required
          error={errors.email}
          errorId={`${uid}-email-error`}
        >
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" aria-hidden="true">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
            </span>
            <input
              id={`${uid}-email`}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange('email')}
              className={`${errors.email ? inputError : inputNormal} pl-10`}
              placeholder="votre@email.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? `${uid}-email-error` : undefined}
              disabled={loading}
              autoComplete="email"
            />
          </div>
        </Field>
      </div>

      {/* ── Téléphone ── */}
      <Field
        id={`${uid}-phone`}
        label="Téléphone (optionnel)"
        error={errors.phone}
        errorId={`${uid}-phone-error`}
      >
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" aria-hidden="true">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 015.19 12a19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
            </svg>
          </span>
          <input
            id={`${uid}-phone`}
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange('phone')}
            className={`${errors.phone ? inputError : inputNormal} pl-10`}
            placeholder="+41 79 123 45 67"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? `${uid}-phone-error` : undefined}
            disabled={loading}
            autoComplete="tel"
          />
        </div>
      </Field>

      {/* ── Message ── */}
      <Field
        id={`${uid}-message`}
        label="Votre message"
        required
        error={errors.message}
        errorId={`${uid}-message-error`}
      >
        <textarea
          id={`${uid}-message`}
          name="message"
          value={formData.message}
          onChange={handleChange('message')}
          className={`${errors.message ? inputError : inputNormal} resize-none min-h-[130px]`}
          placeholder="Décrivez votre projet en quelques mots..."
          rows={5}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? `${uid}-message-error` : undefined}
          disabled={loading}
        />
        <div
          className="text-right text-xs"
          style={{ color: formData.message.length > 950 ? '#f87171' : '#6b7280' }}
          aria-live="polite"
          aria-atomic="true"
        >
          {formData.message.length}/1000
        </div>
      </Field>

      {/* ── Rassurances ── */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-lime" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          Réponse sous 24h ouvrées
        </span>
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-lime" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          Données protégées (nLPD)
        </span>
      </div>

      {/* ── Bouton de soumission ── */}
      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className="w-full flex items-center justify-center gap-2.5 bg-lime text-brand-dark font-extrabold text-base px-8 py-4 rounded-xl hover:bg-lime-hover transition-all shadow-lime disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-lime"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin w-5 h-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Envoi en cours…
          </>
        ) : (
          <>
            {submitText}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </>
        )}
      </button>

      {/* ── Mention légale ── */}
      <p className="text-center text-xs text-gray-600 leading-relaxed">
        En soumettant ce formulaire, vous acceptez notre{' '}
        <a href="/politique-confidentialite" className="text-gray-400 hover:text-lime underline underline-offset-4 transition-colors" target="_blank" rel="noopener noreferrer">
          politique de confidentialité
        </a>.
        Vos données ne seront jamais partagées avec des tiers.
      </p>
    </form>
  );
};

export default ContactFormReact;