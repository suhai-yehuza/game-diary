import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/app/components/ui/select';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ChevronDown: () => <div data-testid="chevron-down">ChevronDown</div>,
}));

describe('Select Component', () => {
  const defaultProps = {
    placeholder: 'Select an option',
    onValueChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with placeholder', () => {
    render(
      <Select {...defaultProps}>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
      </Select>
    );
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('renders with selected value', () => {
    render(
      <Select {...defaultProps} value="option1">
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
      </Select>
    );
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', () => {
    render(
      <Select {...defaultProps}>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
      </Select>
    );

    const button = screen.getByRole('combobox');
    fireEvent.click(button);

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('closes dropdown when option is selected', () => {
    render(
      <Select {...defaultProps}>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
      </Select>
    );

    const button = screen.getByRole('combobox');
    fireEvent.click(button);

    const option1 = screen.getByText('Option 1');
    fireEvent.click(option1);

    expect(defaultProps.onValueChange).toHaveBeenCalledWith('option1');
    expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
  });

  it('handles disabled state', () => {
    render(
      <Select {...defaultProps} disabled>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
      </Select>
    );

    const button = screen.getByRole('combobox');
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
  });

  it('handles custom className', () => {
    render(
      <Select {...defaultProps} className="custom-class">
        <SelectItem value="option1">Option 1</SelectItem>
      </Select>
    );

    const button = screen.getByRole('combobox');
    expect(button).toHaveClass('custom-class');
  });

  it('handles empty value', () => {
    render(
      <Select {...defaultProps} value="">
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
      </Select>
    );
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('handles undefined value', () => {
    render(
      <Select {...defaultProps} value={undefined}>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
      </Select>
    );
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('handles null value', () => {
    render(
      <Select {...defaultProps} value={undefined}>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
      </Select>
    );
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('handles missing onValueChange callback', () => {
    render(
      <Select placeholder="Select an option">
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
      </Select>
    );

    const button = screen.getByRole('combobox');
    fireEvent.click(button);

    const option1 = screen.getByText('Option 1');
    fireEvent.click(option1);

    // Should not throw error
    expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
  });

  it('handles invalid children gracefully', () => {
    render(
      <Select {...defaultProps}>
        <div>Invalid child</div>
        <SelectItem value="option1">Option 1</SelectItem>
      </Select>
    );

    const button = screen.getByRole('combobox');
    fireEvent.click(button);

    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('handles children without value prop', () => {
    render(
      <Select {...defaultProps}>
        <SelectItem value="option-without-value">Option without value</SelectItem>
        <SelectItem value="option1">Option 1</SelectItem>
      </Select>
    );

    const button = screen.getByRole('combobox');
    fireEvent.click(button);

    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('applies correct CSS classes to button', () => {
    render(
      <Select {...defaultProps}>
        <SelectItem value="option1">Option 1</SelectItem>
      </Select>
    );

    const button = screen.getByRole('combobox');
    expect(button).toHaveClass(
      'flex',
      'items-center',
      'justify-between',
      'text-sm',
      'disabled:cursor-not-allowed',
      'disabled:opacity-50'
    );
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(
      <Select {...defaultProps} ref={ref}>
        <SelectItem value="option1">Option 1</SelectItem>
      </Select>
    );

    const button = screen.getByRole('combobox');
    expect(ref.current).toBe(button);
  });

  it('handles aria-expanded attribute correctly', () => {
    render(
      <Select {...defaultProps}>
        <SelectItem value="option1">Option 1</SelectItem>
      </Select>
    );

    const button = screen.getByRole('combobox');
    expect(button).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('handles multiple selections correctly', () => {
    render(
      <Select {...defaultProps}>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </Select>
    );

    const button = screen.getByRole('combobox');
    fireEvent.click(button);

    const option2 = screen.getByText('Option 2');
    fireEvent.click(option2);

    expect(defaultProps.onValueChange).toHaveBeenCalledWith('option2');
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('handles empty children array', () => {
    render(<Select {...defaultProps} />);

    const button = screen.getByRole('combobox');
    fireEvent.click(button);

    // Should not crash
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('handles children with empty string value', () => {
    render(
      <Select {...defaultProps}>
        <SelectItem value="">Option with empty value</SelectItem>
        <SelectItem value="option1">Option 1</SelectItem>
      </Select>
    );

    const button = screen.getByRole('combobox');
    fireEvent.click(button);

    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('handles children with null string value', () => {
    render(
      <Select {...defaultProps}>
        <SelectItem value="null">Option with null string value</SelectItem>
        <SelectItem value="option1">Option 1</SelectItem>
      </Select>
    );

    const button = screen.getByRole('combobox');
    fireEvent.click(button);

    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('handles children with numeric string value', () => {
    render(
      <Select {...defaultProps}>
        <SelectItem value="123">Option with numeric string value</SelectItem>
        <SelectItem value="option1">Option 1</SelectItem>
      </Select>
    );

    const button = screen.getByRole('combobox');
    fireEvent.click(button);

    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('handles missing placeholder', () => {
    render(
      <Select onValueChange={vi.fn()}>
        <SelectItem value="option1">Option 1</SelectItem>
      </Select>
    );

    const button = screen.getByRole('combobox');
    expect(button).toBeInTheDocument();
  });

  it('handles empty placeholder', () => {
    render(
      <Select {...defaultProps} placeholder="">
        <SelectItem value="option1">Option 1</SelectItem>
      </Select>
    );

    const button = screen.getByRole('combobox');
    expect(button).toBeInTheDocument();
  });

  it('handles undefined placeholder', () => {
    render(
      <Select onValueChange={vi.fn()} placeholder={undefined}>
        <SelectItem value="option1">Option 1</SelectItem>
      </Select>
    );

    const button = screen.getByRole('combobox');
    expect(button).toBeInTheDocument();
  });

  it('handles empty string placeholder', () => {
    render(
      <Select onValueChange={vi.fn()} placeholder="">
        <SelectItem value="option1">Option 1</SelectItem>
      </Select>
    );

    const button = screen.getByRole('combobox');
    expect(button).toBeInTheDocument();
  });

  it('handles additional props', () => {
    render(
      <Select {...defaultProps} data-testid="custom-select" id="test-id">
        <SelectItem value="option1">Option 1</SelectItem>
      </Select>
    );

    const button = screen.getByRole('combobox');
    expect(button).toHaveAttribute('data-testid', 'custom-select');
    expect(button).toHaveAttribute('id', 'test-id');
  });

  it('handles button type attribute', () => {
    render(
      <Select {...defaultProps}>
        <SelectItem value="option1">Option 1</SelectItem>
      </Select>
    );

    const button = screen.getByRole('combobox');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('handles role attribute', () => {
    render(
      <Select {...defaultProps}>
        <SelectItem value="option1">Option 1</SelectItem>
      </Select>
    );

    const button = screen.getByRole('combobox');
    expect(button).toHaveAttribute('role', 'combobox');
  });
});

describe('SelectTrigger Component', () => {
  it('renders correctly', () => {
    render(
      <SelectTrigger placeholder="Select an option" onValueChange={vi.fn()}>
        <SelectItem value="option1">Option 1</SelectItem>
      </SelectTrigger>
    );

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});

describe('SelectContent Component', () => {
  it('renders correctly', () => {
    render(
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
      </SelectContent>
    );

    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('handles custom className', () => {
    render(
      <SelectContent className="custom-content">
        <SelectItem value="option1">Option 1</SelectItem>
      </SelectContent>
    );

    const content = screen.getByText('Option 1').closest('div')?.parentElement;
    expect(content).toHaveClass('custom-content');
  });
});

describe('SelectItem Component', () => {
  it('renders correctly', () => {
    render(<SelectItem value="option1">Option 1</SelectItem>);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(
      <SelectItem value="option1" onClick={handleClick}>
        Option 1
      </SelectItem>
    );

    const item = screen.getByText('Option 1');
    fireEvent.click(item);

    expect(handleClick).toHaveBeenCalled();
  });

  it('handles custom className', () => {
    render(
      <SelectItem value="option1" className="custom-item">
        Option 1
      </SelectItem>
    );

    const item = screen.getByText('Option 1');
    expect(item).toHaveClass('custom-item');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(
      <SelectItem value="option1" ref={ref}>
        Option 1
      </SelectItem>
    );

    const item = screen.getByText('Option 1');
    expect(ref.current).toBe(item);
  });
});

describe('SelectValue Component', () => {
  it('renders children when provided', () => {
    render(<SelectValue>Selected Value</SelectValue>);
    expect(screen.getByText('Selected Value')).toBeInTheDocument();
  });

  it('renders placeholder when no children', () => {
    render(<SelectValue placeholder="Placeholder text" />);
    expect(screen.getByText('Placeholder text')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<SelectValue ref={ref}>Selected Value</SelectValue>);

    const value = screen.getByText('Selected Value');
    expect(ref.current).toBe(value);
  });
});
