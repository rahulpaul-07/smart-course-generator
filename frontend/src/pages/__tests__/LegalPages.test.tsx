import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import PrivacyPage from '../PrivacyPage';
import TermsPage from '../TermsPage';
import { LandingFooter } from '../../components/landing/LandingFooter';
import { CONTACT_EMAIL } from '../../components/legal/LegalDocument';

const renderAt = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('legal pages', () => {
  it('privacy policy names the data processors and how to request deletion', () => {
    renderAt(<PrivacyPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Privacy policy' })).toBeInTheDocument();
    expect(screen.getByText(/Google Gemini, Groq or OpenRouter/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: CONTACT_EMAIL })).toHaveAttribute('href', `mailto:${CONTACT_EMAIL}`);
    expect(document.title).toBe('Privacy policy | CourseAI');
  });

  it('terms of use say generated content can be wrong', () => {
    renderAt(<TermsPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Terms of use' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'AI-generated content can be wrong' })).toBeInTheDocument();
  });

  it('the landing footer links to both documents', () => {
    renderAt(<LandingFooter />);
    expect(screen.getByRole('link', { name: 'Privacy policy' })).toHaveAttribute('href', '/privacy');
    expect(screen.getByRole('link', { name: 'Terms of use' })).toHaveAttribute('href', '/terms');
  });
});
