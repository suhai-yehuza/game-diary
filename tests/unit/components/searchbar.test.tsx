import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { SearchBar } from '@/app/components/layout/components/SearchBar';

describe('SearchBar', () => {
  it('renders search input with placeholder', () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/search/i);
    expect(input).toBeInTheDocument();
  });

  it('updates value when typing', () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'test query' } });
    expect(input).toHaveValue('test query');
  });

  it('clears input when clear button is clicked', () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'clear me' } });
    expect(input).toHaveValue('clear me');
    // Show clear button
    const clearBtn = screen.getByRole('button', { name: /clear search/i });
    fireEvent.mouseDown(clearBtn);
    expect(input).toHaveValue('');
  });

  it('handles focus and blur', async () => {
    render(<SearchBar />);
    await userEvent.tab(); // Tab to the input
    let input = screen.getByPlaceholderText(/search/i);
    expect(input).toHaveFocus();
    input.blur();
    expect(input).not.toHaveFocus();
  });

  it('expands on focus and contracts on blur', async () => {
    render(<SearchBar />);
    let input = screen.getByPlaceholderText(/search/i);
    // Initial: should have contracted class
    let form = input.closest('form');
    expect(form!.className).toContain('max-w-[140px]');

    // Focus (expand)
    await userEvent.tab();
    input = screen.getByPlaceholderText(/search/i);
    form = input.closest('form');
    expect(form!.className).toContain('max-w-[95vw]');

    // Blur (contract) by clicking outside
    await userEvent.click(document.body);
    input = screen.getByPlaceholderText(/search/i);
    form = input.closest('form');
    expect(form!.className).toContain('max-w-[140px]');
  });
});
