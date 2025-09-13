import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { Input } from '@/app/components/ui/input';

describe('Input Component', () => {
  it('renders with default props', () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
  });

  it('renders with custom type', () => {
    render(<Input type="email" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('renders with custom className', () => {
    render(<Input className="custom-class" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('custom-class');
  });

  it('renders with placeholder', () => {
    render(<Input placeholder="Enter text" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('placeholder', 'Enter text');
  });

  it('renders with value', () => {
    render(<Input value="test value" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveValue('test value');
  });

  it('renders with disabled state', () => {
    render(<Input disabled data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toBeDisabled();
  });

  it('renders with required attribute', () => {
    render(<Input required data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toBeRequired();
  });

  it('renders with name attribute', () => {
    render(<Input name="test-name" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('name', 'test-name');
  });

  it('renders with id attribute', () => {
    render(<Input id="test-id" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('id', 'test-id');
  });

  it('renders with aria-label', () => {
    render(<Input aria-label="Test input" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('aria-label', 'Test input');
  });

  it('renders with multiple props', () => {
    render(
      <Input
        type="password"
        placeholder="Enter password"
        className="password-input"
        disabled
        required
        data-testid="input"
      />
    );
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAttribute('placeholder', 'Enter password');
    expect(input).toHaveClass('password-input');
    expect(input).toBeDisabled();
    expect(input).toBeRequired();
  });

  it('applies default CSS classes', () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass(
      'flex',
      'h-11',
      'w-full',
      'rounded-md',
      'border',
      'border-theme-primary',
      'bg-surface-card',
      'px-3',
      'py-2',
      'text-sm',
      'text-theme-primary',
      'ring-offset-background',
      'file:border-0',
      'file:bg-transparent',
      'file:text-sm',
      'file:font-medium',
      'placeholder:text-theme-muted',
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-brand-primary',
      'focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed',
      'disabled:opacity-50'
    );
  });

  it('combines default and custom classes', () => {
    render(<Input className="custom-class" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('custom-class');
    expect(input).toHaveClass('flex', 'h-11', 'w-full'); // Some default classes
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Input ref={ref} data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(ref.current).toBe(input);
  });

  it('handles different input types', () => {
    const types = ['text', 'email', 'password', 'number', 'tel', 'url', 'search'];

    types.forEach(type => {
      const { unmount } = render(<Input type={type} data-testid={`input-${type}`} />);
      const input = screen.getByTestId(`input-${type}`);
      expect(input).toHaveAttribute('type', type);
      unmount();
    });
  });

  it('handles empty className', () => {
    render(<Input className="" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toBeInTheDocument();
  });

  it('handles undefined className', () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toBeInTheDocument();
  });

  it('handles undefined className', () => {
    render(<Input className={undefined} data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toBeInTheDocument();
  });

  it('renders with readOnly attribute', () => {
    render(<Input readOnly autoComplete="off" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('readonly');
    expect(input).toHaveAttribute('autocomplete', 'off');
  });

  it('renders with form attribute', () => {
    render(<Input form="test-form" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('form', 'test-form');
  });

  it('renders with pattern attribute', () => {
    render(<Input pattern="[0-9]+" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('pattern', '[0-9]+');
  });

  it('renders with min and max attributes', () => {
    render(<Input min="0" max="100" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '100');
  });

  it('renders with step attribute', () => {
    render(<Input step="0.1" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('step', '0.1');
  });

  it('renders with size attribute', () => {
    render(<Input size={20} data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('size', '20');
  });

  it('renders with maxLength attribute', () => {
    render(<Input maxLength={50} data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('maxlength', '50');
  });

  it('renders with minLength attribute', () => {
    render(<Input minLength={3} data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('minlength', '3');
  });

  it('renders with autoCapitalize attribute', () => {
    render(<Input autoCapitalize="words" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('autocapitalize', 'words');
  });

  it('renders with autoCorrect attribute', () => {
    render(<Input autoCorrect="off" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('autocorrect', 'off');
  });

  it('renders with enterKeyHint attribute', () => {
    render(<Input enterKeyHint="search" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('enterkeyhint', 'search');
  });

  it('renders with inputMode attribute', () => {
    render(<Input inputMode="numeric" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('inputmode', 'numeric');
  });

  it('renders with list attribute', () => {
    render(<Input list="test-list" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('list', 'test-list');
  });

  it('renders with all form attributes', () => {
    render(
      <Input
        type="email"
        placeholder="Enter email"
        required
        disabled
        className="email-input"
        id="email-field"
        name="email"
        data-testid="input"
      />
    );
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('placeholder', 'Enter email');
    expect(input).toBeRequired();
    expect(input).toBeDisabled();
    expect(input).toHaveClass('email-input');
    expect(input).toHaveAttribute('id', 'email-field');
    expect(input).toHaveAttribute('name', 'email');
  });
});
