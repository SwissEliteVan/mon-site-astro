import React, { useState, useRef, useEffect } from 'react';
import type { FormEvent, ChangeEvent } from 'react';

interface ContactFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  submit?: string;
}

const ContactFormReact: React.FC<ContactFormProps> = ({ 
  onSuccess, 
  onError, 
  className = '' 
}) => {
  // États du formulaire
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [botField, setBotField] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Références
  const formRef = useRef<HTMLFormElement>(null);
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Nettoyage du timeout au démontage du composant
  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  // Validation Front-end (Identique aux règles Zod du backend)
  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Le nom est requis';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères';
    } else if (name.trim().length > 50) {
      newErrors.name = 'Le nom ne peut pas dépasser 50 caractères';
    }
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Adresse email invalide';
    }
    
    if (phone && phone.trim()) {
      const phoneRegex = /^[0-9+\-\s()]{8,20}$/;
      if (!phoneRegex.test(phone.trim())) {
        newErrors.phone = 'Format de téléphone invalide';
      }
    }
    
    if (!message.trim()) {
      newErrors.message = 'Le message est requis';
    } else if (message.trim().length < 10) {
      newErrors.message = 'Le message doit contenir au moins 10 caractères';
    } else if (message.trim().length > 1000) {
      newErrors.message = 'Le message ne peut pas dépasser 1000 caractères';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Protection Honeypot Front-end : Bloque le bot avant même d'appeler l'API
    if (botField) {
      setSuccess(true);
      if (onSuccess) onSuccess();
      return;
    }

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstError = document.querySelector('.error-message');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: name.trim(), 
          email: email.trim().toLowerCase(), 
          phone: phone.trim() || '', // Zod accepte une string vide si non fourni
          message: message.trim(),
          honeypot: botField
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
        setErrors({});
        setBotField('');
        if (onSuccess) onSuccess();
        
        submitTimeoutRef.current = setTimeout(() => {
          setSuccess(false);
        }, 8000);
      } else {
        // Parsing intelligent des erreurs Zod renvoyées par le backend
        if (data.errors && Array.isArray(data.errors)) {
          const backendErrors: FormErrors = {};
          data.errors.forEach((err: string) => {
            const lowerErr = err.toLowerCase();
            if (lowerErr.includes('nom')) backendErrors.name = err;
            else if (lowerErr.includes('email') || lowerErr.includes('adresse')) backendErrors.email = err;
            else if (lowerErr.includes('téléphone')) backendErrors.phone = err;
            else if (lowerErr.includes('message')) backendErrors.message = err;
            else backendErrors.submit = err;
          });
          setErrors(backendErrors);
        } else {
          throw new Error(data.message || 'Erreur lors de l\'envoi');
        }
      }
    } catch (error) {
      const err = error as Error;
      setErrors({ submit: err.message || 'Le serveur ne répond pas. Veuillez réessayer plus tard.' });
      if (onError) onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccess(false);
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
    setErrors({});
    setBotField('');
  };

  return (
    <div className={`contact-container ${className}`}>
      {success ? (
        <div className="message-box success" role="status" aria-live="polite">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <p>Message envoyé avec succès ! Je vous recontacte rapidement.</p>
          <button onClick={handleReset} className="reset-btn">
            Envoyer un autre message
          </button>
        </div>
      ) : (
        <form ref={formRef} className="contact-form" onSubmit={handleSubmit} noValidate>
          {errors.submit && (
            <div className="message-box error" role="alert" aria-live="assertive">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p>{errors.submit}</p>
            </div>
          )}

          {/* HONEYPOT INVISIBLE */}
          <div style={{ position: 'absolute', left: '-5000px', top: '-5000px', opacity: 0, zIndex: -1 }} aria-hidden="true">
            <label htmlFor="honeypot">Ne pas remplir ce champ si vous êtes humain</label>
            <input
              id="honeypot"
              type="text"
              name="honeypot"
              value={botField}
              onChange={(e) => setBotField(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">
                Nom complet <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setName(e.target.value);
                    if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                  }}
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="Votre nom complet"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  disabled={loading}
                />
              </div>
              {errors.name && (
                <span id="name-error" className="error-message" role="alert">
                  {errors.name}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Adresse email <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="votre@email.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <span id="email-error" className="error-message" role="alert">
                  {errors.email}
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Téléphone (optionnel)</label>
            <div className="input-wrapper">
              <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                }}
                className={`form-input ${errors.phone ? 'error' : ''}`}
                placeholder="+41 79 123 45 67"
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
                disabled={loading}
              />
            </div>
            {errors.phone && (
              <span id="phone-error" className="error-message" role="alert">
                {errors.phone}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="message">
              Message <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <svg className="input-icon textarea-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <textarea
                id="message"
                value={message}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                  setMessage(e.target.value);
                  if (errors.message) setErrors(prev => ({ ...prev, message: undefined }));
                }}
                className={`form-input form-textarea ${errors.message ? 'error' : ''}`}
                placeholder="Décrivez votre projet en quelques mots..."
                rows={5}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? 'message-error' : undefined}
                disabled={loading}
              />
            </div>
            {errors.message && (
              <span id="message-error" className="error-message" role="alert">
                {errors.message}
              </span>
            )}
            <div className="char-counter" style={{ textAlign: 'right', fontSize: '0.75rem', color: message.length > 950 ? 'var(--color-danger)' : '#6b7280', marginTop: '0.25rem' }}>
              {message.length}/1000
            </div>
          </div>

          <div className="form-reassurance">
            <div className="reassurance-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>Réponse sous 24h</span>
            </div>
            <div className="reassurance-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span>Données sécurisées</span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="submit-btn"
            aria-busy={loading}
          >
            {loading ? (
              <>
                <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style={{ width: '1.25rem', height: '1.25rem', animation: 'spin 1s linear infinite' }}>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                Envoi en cours...
              </>
            ) : 'Envoyer le message'}
          </button>

          <div className="form-legal">
            En soumettant ce formulaire, vous acceptez notre{' '}
            <a href="/politique-confidentialite" target="_blank" rel="noopener noreferrer">
              politique de confidentialité
            </a>.
            <br />
            Nous ne partagerons jamais vos informations avec des tiers.
          </div>
        </form>
      )}
    </div>
  );
};

export default ContactFormReact;