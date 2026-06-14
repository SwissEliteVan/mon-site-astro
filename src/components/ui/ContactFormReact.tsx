import React, { useState, FormEvent, ChangeEvent } from 'react';

interface ContactFormProps {
  title?: string;
  subtitle?: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
  submit?: string;
}

const ContactFormReact: React.FC<ContactFormProps> = ({ 
  title = "Parlons de votre projet", 
  subtitle = "Remplissez le formulaire ci-dessous et je vous recontacte dans les plus brefs délais."
}) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!name) newErrors.name = 'Le nom est requis';
    if (!email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email invalide';
    }
    if (!message) newErrors.message = 'Le message est requis';
    return newErrors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      if (response.ok) {
        setSuccess(true);
        setName('');
        setEmail('');
        setMessage('');
        setErrors({});
      } else {
        throw new Error('Erreur lors de l\'envoi');
      }
    } catch (error) {
      const err = error as Error;
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-container">
      <div className="contact-header">
        <span className="contact-badge">Consultation Stratégique Offerte</span>
        <h2 className="contact-title">{title}</h2>
        <p className="contact-subtitle">{subtitle}</p>
      </div>

      {success ? (
        <div className="success-message">
          <p>Message envoyé avec succès ! Je vous recontacte rapidement.</p>
        </div>
      ) : (
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nom</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              value={message}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
              className={errors.message ? 'error' : ''}
            />
            {errors.message && <span className="error-message">{errors.message}</span>}
          </div>

          {errors.submit && <span className="error-message">{errors.submit}</span>}

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Envoi en cours...' : 'Envoyer'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ContactFormReact;