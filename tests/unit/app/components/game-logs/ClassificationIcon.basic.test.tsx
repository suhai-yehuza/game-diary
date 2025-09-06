import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { ClassificationIcon } from '@/app/components/game-logs/ClassificationIcon';
import { CLASSIFICATION } from '@/types';

describe('ClassificationIcon', () => {
  it('renders eye icon for public classification', () => {
    render(<ClassificationIcon classification={CLASSIFICATION.PUBLIC} />);
    expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
  });

  it('renders users icon for protected classification', () => {
    render(<ClassificationIcon classification={CLASSIFICATION.PROTECTED} />);
    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
  });

  it('renders lock icon for private classification', () => {
    render(<ClassificationIcon classification={CLASSIFICATION.PRIVATE} />);
    expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
  });

  it('renders eye-off icon for unknown classification', () => {
    render(<ClassificationIcon classification="UNKNOWN" />);
    expect(screen.getByTestId('eye-off-icon')).toBeInTheDocument();
  });

  it('renders eye-off icon for empty classification', () => {
    render(<ClassificationIcon classification="" />);
    expect(screen.getByTestId('eye-off-icon')).toBeInTheDocument();
  });

  it('applies correct CSS classes for public classification', () => {
    render(<ClassificationIcon classification={CLASSIFICATION.PUBLIC} />);
    const icon = screen.getByTestId('eye-icon');
    expect(icon).toHaveClass('w-4', 'h-4', 'text-semantic-success');
  });

  it('applies correct CSS classes for protected classification', () => {
    render(<ClassificationIcon classification={CLASSIFICATION.PROTECTED} />);
    const icon = screen.getByTestId('users-icon');
    expect(icon).toHaveClass('w-4', 'h-4', 'text-semantic-warning');
  });

  it('applies correct CSS classes for private classification', () => {
    render(<ClassificationIcon classification={CLASSIFICATION.PRIVATE} />);
    const icon = screen.getByTestId('lock-icon');
    expect(icon).toHaveClass('w-4', 'h-4', 'text-semantic-error');
  });

  it('applies correct CSS classes for unknown classification', () => {
    render(<ClassificationIcon classification="UNKNOWN" />);
    const icon = screen.getByTestId('eye-off-icon');
    expect(icon).toHaveClass('w-4', 'h-4', 'text-neutral-400');
  });
});
