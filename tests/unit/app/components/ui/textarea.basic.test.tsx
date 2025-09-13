import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { Textarea } from '@src/app/components/ui/textarea';

describe('Textarea', () => {
  it('renders with default props', () => {
    render(<Textarea data-testid="textarea" />);

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('applies custom className', () => {
    render(<Textarea data-testid="textarea" className="custom-class" />);

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Textarea ref={ref} data-testid="textarea" />);

    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('applies all standard textarea props', () => {
    render(
      <Textarea
        data-testid="textarea"
        placeholder="Enter text"
        rows={5}
        cols={50}
        disabled
        readOnly
      />
    );

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveAttribute('placeholder', 'Enter text');
    expect(textarea).toHaveAttribute('rows', '5');
    expect(textarea).toHaveAttribute('cols', '50');
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveAttribute('readonly');
  });

  it('has correct default styling classes', () => {
    render(<Textarea data-testid="textarea" />);

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass(
      'flex',
      'min-h-[80px]',
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
      'placeholder:text-theme-muted',
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-brand-primary',
      'focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed',
      'disabled:opacity-50'
    );
  });

  it('combines custom className with default classes', () => {
    render(<Textarea data-testid="textarea" className="my-custom-class" />);

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass('my-custom-class');
    expect(textarea).toHaveClass('flex', 'min-h-[80px]', 'w-full');
  });

  it('handles value and onChange', () => {
    const handleChange = vi.fn();
    render(<Textarea data-testid="textarea" value="test value" onChange={handleChange} />);

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveValue('test value');
  });
});
