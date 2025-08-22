import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Search: () => <span data-testid="search-icon">🔍</span>,
  X: () => <span data-testid="close-icon">✕</span>,
  Clock: () => <span data-testid="clock-icon">Clock</span>,
  TrendingUp: () => <span data-testid="trending-up-icon">TrendingUp</span>,
  User: () => <span data-testid="user-icon">User</span>,
  Trophy: () => <span data-testid="trophy-icon">Trophy</span>,
  Gamepad2: () => <span data-testid="gamepad2-icon">Gamepad2</span>,
  Building2: () => <span data-testid="building2-icon">Building2</span>,
  Hash: () => <span data-testid="hash-icon">Hash</span>,
}));

import { SearchBar } from '@/app/components/layout/components/SearchBar';

describe('SearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input with placeholder', () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/search/i);
    expect(input).toBeInTheDocument();
  });

  it('renders search icon', () => {
    render(<SearchBar />);
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  it('renders close button when input has text', async () => {
    const user = userEvent.setup();
    render(<SearchBar />);

    // Initially no close button
    expect(screen.queryByTestId('close-icon')).not.toBeInTheDocument();

    // Type text to show close button
    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, 'test');
    expect(screen.getByTestId('close-icon')).toBeInTheDocument();
  });

  it('updates value when typing', async () => {
    const user = userEvent.setup();
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, 'test query');
    expect(input).toHaveValue('test query');
  });

  it('handles focus and blur', async () => {
    const user = userEvent.setup();
    render(<SearchBar />);
    await user.tab(); // Tab to the input
    const input = screen.getByPlaceholderText(/search/i);
    expect(input).toHaveFocus();
    await user.click(document.body); // Click outside to blur
    expect(input).not.toHaveFocus();
  });

  it('expands on focus and contracts on blur', async () => {
    const user = userEvent.setup();
    render(<SearchBar />);
    let input = screen.getByPlaceholderText(/search/i);
    // Initial: should have contracted class
    let form = input.closest('form');
    expect(form!.className).toContain('max-w-[140px]');

    // Focus (expand)
    await user.tab();
    input = screen.getByPlaceholderText(/search/i);
    form = input.closest('form');
    expect(form!.className).toContain('max-w-[95vw]');

    // Blur (contract) by clicking outside
    await user.click(document.body);
    input = screen.getByPlaceholderText(/search/i);
    form = input.closest('form');
    expect(form!.className).toContain('max-w-[140px]');
  });

  it('handles autoFocus prop', () => {
    render(<SearchBar autoFocus={true} />);
    const input = screen.getByPlaceholderText(/search/i);
    expect(input).toHaveFocus();
  });

  it('handles special characters in search', async () => {
    const user = userEvent.setup();
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/search/i);

    await user.type(input, 'test@#$%^&*()');
    expect(input).toHaveValue('test@#$%^&*()');
  });

  it('handles very long search queries', async () => {
    const user = userEvent.setup();
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/search/i);

    const longQuery = 'a'.repeat(1000);
    await user.type(input, longQuery);
    expect(input).toHaveValue(longQuery);
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/search/i);

    // Tab to focus
    await user.tab();
    expect(input).toHaveFocus();

    // Type something
    await user.type(input, 'test');
    expect(input).toHaveValue('test');
  });

  it('has proper accessibility attributes', () => {
    render(<SearchBar />);
    const input = screen.getByRole('searchbox');
    expect(input).toHaveAttribute('id', 'search-input');
    expect(input).toHaveAttribute('placeholder', 'Global search...');
    expect(input).toHaveAttribute('type', 'search');
  });
});
