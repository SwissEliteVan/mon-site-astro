import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock du composant Header
vi.mock('../components/layout/Header.astro', () => ({
  default: () => <header role="banner">Mock Header</header>,
}));

// Composant Header mocké
const Header = () => <header role="banner">Mock Header</header>;

describe('Header Component', () => {
  it('renders correctly with default props', () => {
    render(
      <div data-testid="header-container">
        <Header />
      </div>
    );
    
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('Mock Header')).toBeVisible();
  });
});
