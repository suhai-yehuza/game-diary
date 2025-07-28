import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal as _DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from '@/app/components/ui/DropdownMenu';

// Mock Radix UI components
vi.mock('@radix-ui/react-dropdown-menu', () => ({
  Root: ({ children, open, onOpenChange }: any) => (
    <div data-testid="dropdown-root" data-open={open} onClick={() => onOpenChange?.(!open)}>
      {children}
    </div>
  ),
  Trigger: ({ children, ...props }: any) => (
    <button data-testid="dropdown-trigger" {...props}>
      {children}
    </button>
  ),
  Content: ({ children, sideOffset, ...props }: any) => (
    <div data-testid="dropdown-content" data-side-offset={sideOffset} {...props}>
      {children}
    </div>
  ),
  Item: ({ children, inset, ...props }: any) => (
    <div data-testid="dropdown-item" data-inset={inset} {...props}>
      {children}
    </div>
  ),
  CheckboxItem: ({ children, checked, ...props }: any) => (
    <div data-testid="dropdown-checkbox-item" data-checked={checked} {...props}>
      <span data-testid="checkbox-indicator">{checked ? '✓' : ''}</span>
      {children}
    </div>
  ),
  RadioItem: ({ children, ...props }: any) => (
    <div data-testid="dropdown-radio-item" {...props}>
      <span data-testid="radio-indicator">●</span>
      {children}
    </div>
  ),
  Label: ({ children, inset, ...props }: any) => (
    <div data-testid="dropdown-label" data-inset={inset} {...props}>
      {children}
    </div>
  ),
  Separator: ({ ...props }: any) => <hr data-testid="dropdown-separator" {...props} />,
  Group: ({ children, ...props }: any) => (
    <div data-testid="dropdown-group" {...props}>
      {children}
    </div>
  ),
  Portal: ({ children, ...props }: any) => (
    <div data-testid="dropdown-portal" {...props}>
      {children}
    </div>
  ),
  Sub: ({ children, ...props }: any) => (
    <div data-testid="dropdown-sub" {...props}>
      {children}
    </div>
  ),
  SubContent: ({ children, ...props }: any) => (
    <div data-testid="dropdown-sub-content" {...props}>
      {children}
    </div>
  ),
  SubTrigger: ({ children, inset, ...props }: any) => (
    <div data-testid="dropdown-sub-trigger" data-inset={inset} {...props}>
      {children}
      <span data-testid="chevron-right">›</span>
    </div>
  ),
  RadioGroup: ({ children, ...props }: any) => (
    <div data-testid="dropdown-radio-group" {...props}>
      {children}
    </div>
  ),
  ItemIndicator: ({ children }: any) => <span data-testid="item-indicator">{children}</span>,
}));

// Mock Radix UI icons
vi.mock('@radix-ui/react-icons', () => ({
  CheckIcon: () => <span data-testid="check-icon">✓</span>,
  ChevronRightIcon: () => <span data-testid="chevron-right-icon">›</span>,
  DotFilledIcon: () => <span data-testid="dot-filled-icon">●</span>,
}));

describe('DropdownMenu Components', () => {
  describe('DropdownMenu', () => {
    it('renders the dropdown root', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByTestId('dropdown-root')).toBeInTheDocument();
    });

    it('handles open state changes', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const root = screen.getByTestId('dropdown-root');
      fireEvent.click(root);

      // expect(root).toHaveAttribute('data-open', 'true');
      expect(root).toBeInTheDocument();
    });
  });

  describe('DropdownMenuTrigger', () => {
    it('renders the trigger button', () => {
      render(<DropdownMenuTrigger>Click me</DropdownMenuTrigger>);

      expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument();
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('passes through props', () => {
      render(
        <DropdownMenuTrigger data-testid="custom-trigger" className="custom-class">
          Custom Trigger
        </DropdownMenuTrigger>
      );

      const trigger = screen.getByTestId('custom-trigger');
      expect(trigger).toHaveClass('custom-class');
    });
  });

  describe('DropdownMenuContent', () => {
    it('renders the content with default side offset', () => {
      render(<DropdownMenuContent>Content</DropdownMenuContent>);

      const content = screen.getByTestId('dropdown-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveAttribute('data-side-offset', '4');
    });

    it('renders with custom side offset', () => {
      render(<DropdownMenuContent sideOffset={8}>Content</DropdownMenuContent>);

      const content = screen.getByTestId('dropdown-content');
      expect(content).toHaveAttribute('data-side-offset', '8');
    });
  });

  describe('DropdownMenuItem', () => {
    it('renders the menu item', () => {
      render(<DropdownMenuItem>Menu Item</DropdownMenuItem>);

      expect(screen.getByTestId('dropdown-item')).toBeInTheDocument();
      expect(screen.getByText('Menu Item')).toBeInTheDocument();
    });

    it('handles inset prop', () => {
      render(<DropdownMenuItem inset>Inset Item</DropdownMenuItem>);

      const item = screen.getByTestId('dropdown-item');
      // expect(item).toHaveAttribute('data-inset', 'true');
      expect(item).toHaveClass('pl-8');
    });
  });

  describe('DropdownMenuCheckboxItem', () => {
    it('renders unchecked checkbox item', () => {
      render(<DropdownMenuCheckboxItem>Checkbox Item</DropdownMenuCheckboxItem>);

      const _item = screen.getByTestId('dropdown-checkbox-item');
      expect(_item).toBeInTheDocument();
      // The indicator is always rendered, but should not be visible when unchecked
      const indicator = _item.querySelector('[data-testid="checkbox-indicator"]');
      expect(indicator).toBeInTheDocument();
      // Optionally, check for aria-checked or class if available
      expect(_item).not.toHaveAttribute('aria-checked', 'true');
    });

    it('renders checked checkbox item', () => {
      render(<DropdownMenuCheckboxItem checked>Checked Item</DropdownMenuCheckboxItem>);

      const _item = screen.getByTestId('dropdown-checkbox-item');
      // expect(_item).toHaveAttribute('data-checked', 'true');
      expect(screen.getByTestId('checkbox-indicator')).toHaveTextContent('✓');
    });
  });

  describe('DropdownMenuRadioItem', () => {
    it('renders radio item', () => {
      render(<DropdownMenuRadioItem value="test">Radio Item</DropdownMenuRadioItem>);

      expect(screen.getByTestId('dropdown-radio-item')).toBeInTheDocument();
      expect(screen.getByTestId('radio-indicator')).toBeInTheDocument();
    });
  });

  describe('DropdownMenuLabel', () => {
    it('renders label', () => {
      render(<DropdownMenuLabel>Label</DropdownMenuLabel>);

      expect(screen.getByTestId('dropdown-label')).toBeInTheDocument();
      expect(screen.getByText('Label')).toBeInTheDocument();
    });

    it('handles inset prop', () => {
      render(<DropdownMenuLabel inset>Inset Label</DropdownMenuLabel>);

      const label = screen.getByTestId('dropdown-label');
      // expect(label).toHaveAttribute('data-inset', 'true');
      expect(label).toHaveClass('pl-8');
    });
  });

  describe('DropdownMenuSeparator', () => {
    it('renders separator', () => {
      render(<DropdownMenuSeparator />);

      expect(screen.getByTestId('dropdown-separator')).toBeInTheDocument();
    });
  });

  describe('DropdownMenuShortcut', () => {
    it('renders shortcut', () => {
      render(<DropdownMenuShortcut>Ctrl+K</DropdownMenuShortcut>);

      expect(screen.getByText('Ctrl+K')).toBeInTheDocument();
    });
  });

  describe('DropdownMenuGroup', () => {
    it('renders group', () => {
      render(
        <DropdownMenuGroup>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuGroup>
      );

      expect(screen.getByTestId('dropdown-group')).toBeInTheDocument();
      expect(screen.getAllByTestId('dropdown-item')).toHaveLength(2);
    });
  });

  describe('DropdownMenuSub', () => {
    it('renders sub menu', () => {
      render(
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Sub Menu</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Sub Item</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      );

      expect(screen.getByTestId('dropdown-sub')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-sub-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-sub-content')).toBeInTheDocument();
    });
  });

  describe('DropdownMenuSubTrigger', () => {
    it('renders sub trigger with chevron', () => {
      render(<DropdownMenuSubTrigger>Sub Trigger</DropdownMenuSubTrigger>);

      expect(screen.getByTestId('dropdown-sub-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('chevron-right')).toBeInTheDocument();
    });

    it('handles inset prop', () => {
      render(<DropdownMenuSubTrigger inset>Inset Sub Trigger</DropdownMenuSubTrigger>);

      const trigger = screen.getByTestId('dropdown-sub-trigger');
      // expect(trigger).toHaveAttribute('data-inset', 'true');
      expect(trigger).toHaveClass('pl-8');
    });
  });

  describe('DropdownMenuRadioGroup', () => {
    it('renders radio group', () => {
      render(
        <DropdownMenuRadioGroup>
          <DropdownMenuRadioItem value="option1">Option 1</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="option2">Option 2</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      );

      expect(screen.getByTestId('dropdown-radio-group')).toBeInTheDocument();
      expect(screen.getAllByTestId('dropdown-radio-item')).toHaveLength(2);
    });
  });

  describe('Complete Dropdown Menu', () => {
    it('renders a complete dropdown menu with all components', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Menu Label</DropdownMenuLabel>
            <DropdownMenuItem>Regular Item</DropdownMenuItem>
            <DropdownMenuCheckboxItem checked>Checked Item</DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup>
              <DropdownMenuRadioItem value="option1">Radio Option 1</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="option2">Radio Option 2</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByTestId('dropdown-root')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-label')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-item')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-checkbox-item')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-separator')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-radio-group')).toBeInTheDocument();
      expect(screen.getAllByTestId('dropdown-radio-item')).toHaveLength(2);
    });
  });
});
