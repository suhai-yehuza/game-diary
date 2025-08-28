import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import { describe, expect, it } from 'vitest';

import { Footer } from '@/app/components/layout/Footer';

// Mock next-themes
const MockThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    {children}
  </ThemeProvider>
);

describe('Footer', () => {
  it('renders footer with proper test id', () => {
    render(
      <MockThemeProvider>
        <Footer />
      </MockThemeProvider>
    );
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders News link', () => {
    render(
      <MockThemeProvider>
        <Footer />
      </MockThemeProvider>
    );
    const newsLink = screen.getByRole('link', { name: /news/i });
    expect(newsLink).toBeInTheDocument();
    expect(newsLink).toHaveAttribute('href', '#news');
  });

  it('renders Contact Us link', () => {
    render(
      <MockThemeProvider>
        <Footer />
      </MockThemeProvider>
    );
    const contactLink = screen.getByRole('link', { name: /contact us/i });
    expect(contactLink).toBeInTheDocument();
    expect(contactLink).toHaveAttribute('href', '#contact');
  });

  it('renders Twitter link with icon', () => {
    render(
      <MockThemeProvider>
        <Footer />
      </MockThemeProvider>
    );
    const twitterLink = screen.getByRole('link', { name: /twitter/i });
    expect(twitterLink).toBeInTheDocument();
    expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/yourprofile');
    expect(twitterLink).toHaveAttribute('target', '_blank');
    expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(twitterLink).toHaveAttribute('aria-label', 'Twitter');
  });

  it('renders Privacy link', () => {
    render(
      <MockThemeProvider>
        <Footer />
      </MockThemeProvider>
    );
    const privacyLink = screen.getByRole('link', { name: /privacy/i });
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute('href', '/privacy');
  });

  it('renders Terms link', () => {
    render(
      <MockThemeProvider>
        <Footer />
      </MockThemeProvider>
    );
    const termsLink = screen.getByRole('link', { name: /terms/i });
    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute('href', '/terms-of-service');
  });

  it('renders Settings link', () => {
    render(
      <MockThemeProvider>
        <Footer />
      </MockThemeProvider>
    );
    const settingsLink = screen.getByRole('link', { name: /settings/i });
    expect(settingsLink).toBeInTheDocument();
    expect(settingsLink).toHaveAttribute('href', '/settings');
  });

  it('renders AI statement with leaf icon', () => {
    render(
      <MockThemeProvider>
        <Footer />
      </MockThemeProvider>
    );
    expect(screen.getByText('Bringing the extra fun to sports')).toBeInTheDocument();

    // Check for the leaf icon (green SVG)
    const leafIcon = document.querySelector('svg[class*="text-green-500"]');
    expect(leafIcon).toBeInTheDocument();
  });

  it('renders with proper spacing and layout classes', () => {
    render(
      <MockThemeProvider>
        <Footer />
      </MockThemeProvider>
    );
    const footer = screen.getByTestId('footer');

    // Check main footer classes (actual classes from the component)
    expect(footer).toHaveClass('w-full', 'py-2', 'text-sm', 'text-neutral-600', 'border-t');

    // Check wrapper classes
    const wrapper = footer.querySelector('.max-w-5xl');
    expect(wrapper).toHaveClass('max-w-5xl', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8');

    // Check flex container classes
    const flexContainer = wrapper?.querySelector('.flex');
    expect(flexContainer).toHaveClass(
      'flex',
      'flex-col',
      'sm:flex-row',
      'flex-wrap',
      'justify-between',
      'items-center',
      'gap-4',
      'text-sm'
    );
  });

  it('renders Twitter link with icon and text', () => {
    render(
      <MockThemeProvider>
        <Footer />
      </MockThemeProvider>
    );
    const twitterLink = screen.getByRole('link', { name: /twitter/i });
    expect(twitterLink).toHaveClass('flex', 'items-center', 'gap-2');
    expect(twitterLink).toHaveTextContent('Twitter');
  });

  it('renders all links with proper hover states', () => {
    render(
      <MockThemeProvider>
        <Footer />
      </MockThemeProvider>
    );
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toHaveClass(
        'hover:text-neutral-900',
        'dark:hover:text-neutral-100',
        'transition-colors'
      );
    });
  });

  it('handles mounted state properly', async () => {
    render(
      <MockThemeProvider>
        <Footer />
      </MockThemeProvider>
    );

    // Should render footer
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});
