// Types pour les props des composants
export interface HeaderProps {
  title?: string;
  navigation?: NavItem[];
}

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

export interface ContactFormProps {
  submitText?: string;
  onSubmit?: (data: FormData) => void;
}

declare module '*.astro' {
  import type { AstroComponentFactory } from 'astro/dist/runtime/server';
  const component: AstroComponentFactory;
  export default component;
}