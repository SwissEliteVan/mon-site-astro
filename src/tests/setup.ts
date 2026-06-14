import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Configuration de base pour les tests
vi.mock('astro:components', () => ({
  __esModule: true,
  default: vi.fn(),
}));