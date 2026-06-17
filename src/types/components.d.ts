import type { FormEvent, ChangeEvent } from 'react';

export interface ContactFormProps {
  onSuccess?: () => void;
  onError?: (message: string) => void;
  className?: string;
  submitText?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  honeypot: string;
}

export interface ContactFormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  submit?: string;
}

export type ApiContactResponse = {
  success: boolean;
  message?: string;
  errors?: string[];
};

// Typage des handlers d'événements
export type FormChangeHandler = (
  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => void;

export type FormSubmitHandler = (e: FormEvent<HTMLFormElement>) => void;