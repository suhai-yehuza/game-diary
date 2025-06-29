import { render, screen } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

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
  DropdownMenuRadioGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@src/app/components/ui/dropdown-menu';

// Mock Radix UI Dropdown Menu
vi.mock('@radix-ui/react-dropdown-menu', () => ({
  Root: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu-root">{children}</div>
  ),
  Trigger: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <button data-testid="dropdown-menu-trigger" {...props}>
      {children}
    </button>
  ),
  Portal: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu-portal">{children}</div>
  ),
  Content: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    [key: string]: unknown;
  }) => (
    <div data-testid="dropdown-menu-content" className={className} {...props}>
      {children}
    </div>
  ),
  Item: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    [key: string]: unknown;
  }) => (
    <div data-testid="dropdown-menu-item" className={className} {...props}>
      {children}
    </div>
  ),
  CheckboxItem: ({
    children,
    className,
    checked,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    checked?: boolean;
    [key: string]: unknown;
  }) => (
    <div
      data-testid="dropdown-menu-checkbox-item"
      className={className}
      data-checked={checked}
      {...props}
    >
      {children}
    </div>
  ),
  RadioItem: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    [key: string]: unknown;
  }) => (
    <div data-testid="dropdown-menu-radio-item" className={className} {...props}>
      {children}
    </div>
  ),
  Label: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    [key: string]: unknown;
  }) => (
    <div data-testid="dropdown-menu-label" className={className} {...props}>
      {children}
    </div>
  ),
  Separator: ({ className, ...props }: { className?: string; [key: string]: unknown }) => (
    <hr data-testid="dropdown-menu-separator" className={className} {...props} />
  ),
  Group: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu-group">{children}</div>
  ),
  RadioGroup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu-radio-group">{children}</div>
  ),
  Sub: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu-sub">{children}</div>
  ),
  SubTrigger: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    [key: string]: unknown;
  }) => (
    <div data-testid="dropdown-menu-sub-trigger" className={className} {...props}>
      {children}
    </div>
  ),
  SubContent: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    [key: string]: unknown;
  }) => (
    <div data-testid="dropdown-menu-sub-content" className={className} {...props}>
      {children}
    </div>
  ),
  ItemIndicator: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="dropdown-menu-item-indicator">{children}</span>
  ),
}));

// Mock Radix UI Icons
vi.mock('@radix-ui/react-icons', () => ({
  CheckIcon: () => <span data-testid="check-icon">✓</span>,
  ChevronRightIcon: () => <span data-testid="chevron-right-icon">›</span>,
  DotFilledIcon: () => <span data-testid="dot-filled-icon">•</span>,
}));

describe('DropdownMenu Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic DropdownMenu', () => {
    it('renders basic dropdown menu structure', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByTestId('dropdown-menu-root')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-menu-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-menu-content')).toBeInTheDocument();
      expect(screen.getAllByTestId('dropdown-menu-item')).toHaveLength(2);
    });

    it('renders trigger with correct text', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Click me</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByText('Click me')).toBeInTheDocument();
    });
  });

  describe('DropdownMenuItem', () => {
    it('renders menu item with correct content', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Test Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const item = screen.getByTestId('dropdown-menu-item');
      expect(item).toBeInTheDocument();
      expect(item).toHaveTextContent('Test Item');
    });

    it('applies custom className', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem className="custom-class">Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const item = screen.getByTestId('dropdown-menu-item');
      expect(item).toHaveClass('custom-class');
    });

    it('handles inset prop', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem inset>Inset Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const item = screen.getByTestId('dropdown-menu-item');
      expect(item).toHaveClass('pl-8');
    });
  });

  describe('DropdownMenuCheckboxItem', () => {
    it('renders checkbox item with correct state', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked>Checkbox Item</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const checkboxItem = screen.getByTestId('dropdown-menu-checkbox-item');
      expect(checkboxItem).toBeInTheDocument();
      expect(checkboxItem).toHaveAttribute('data-checked', 'true');
      expect(checkboxItem).toHaveTextContent('Checkbox Item');
    });

    it('shows check icon when checked', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked>Checkbox Item</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });
  });

  describe('DropdownMenuRadioItem', () => {
    it('renders radio item correctly', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioItem value="option1">Radio Option 1</DropdownMenuRadioItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const radioItem = screen.getByTestId('dropdown-menu-radio-item');
      expect(radioItem).toBeInTheDocument();
      expect(radioItem).toHaveTextContent('Radio Option 1');
    });

    it('shows dot icon', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioItem value="option1">Radio Option</DropdownMenuRadioItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByTestId('dot-filled-icon')).toBeInTheDocument();
    });
  });

  describe('DropdownMenuLabel', () => {
    it('renders label with correct text', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Section Label</DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const label = screen.getByTestId('dropdown-menu-label');
      expect(label).toBeInTheDocument();
      expect(label).toHaveTextContent('Section Label');
    });

    it('handles inset prop', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel inset>Inset Label</DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const label = screen.getByTestId('dropdown-menu-label');
      expect(label).toHaveClass('pl-8');
    });
  });

  describe('DropdownMenuSeparator', () => {
    it('renders separator correctly', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const separator = screen.getByTestId('dropdown-menu-separator');
      expect(separator).toBeInTheDocument();
    });
  });

  describe('DropdownMenuShortcut', () => {
    it('renders shortcut with correct text', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              Copy
              <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByText('⌘C')).toBeInTheDocument();
    });
  });

  describe('DropdownMenuGroup', () => {
    it('renders group correctly', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem>Group Item 1</DropdownMenuItem>
              <DropdownMenuItem>Group Item 2</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByTestId('dropdown-menu-group')).toBeInTheDocument();
    });
  });

  describe('DropdownMenuRadioGroup', () => {
    it('renders radio group correctly', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="option1">
              <DropdownMenuRadioItem value="option1">Option 1</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="option2">Option 2</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByTestId('dropdown-menu-radio-group')).toBeInTheDocument();
      expect(screen.getAllByTestId('dropdown-menu-radio-item')).toHaveLength(2);
    });
  });

  describe('DropdownMenuSub', () => {
    it('renders sub menu correctly', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>More Options</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Sub Item 1</DropdownMenuItem>
                <DropdownMenuItem>Sub Item 2</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByTestId('dropdown-menu-sub')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-menu-sub-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-menu-sub-content')).toBeInTheDocument();
      expect(screen.getByTestId('chevron-right-icon')).toBeInTheDocument();
    });
  });

  describe('Complex DropdownMenu', () => {
    it('renders complex dropdown with all components', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              Copy
              <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Paste
              <DropdownMenuShortcut>⌘V</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked>Show Grid</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Show Rulers</DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value="light">
              <DropdownMenuLabel>Theme</DropdownMenuLabel>
              <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByTestId('dropdown-menu-root')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-menu-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-menu-content')).toBeInTheDocument();
      expect(screen.getAllByTestId('dropdown-menu-label')).toHaveLength(2);
      expect(screen.getAllByTestId('dropdown-menu-item')).toHaveLength(2);
      expect(screen.getAllByTestId('dropdown-menu-checkbox-item')).toHaveLength(2);
      expect(screen.getAllByTestId('dropdown-menu-radio-item')).toHaveLength(2);
      expect(screen.getAllByTestId('dropdown-menu-separator')).toHaveLength(2);
      expect(screen.getByTestId('dropdown-menu-radio-group')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('supports keyboard navigation', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const trigger = screen.getByTestId('dropdown-menu-trigger');
      trigger.focus();
      expect(trigger).toHaveFocus();
    });

    it('handles disabled state', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem disabled>Disabled Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const item = screen.getByTestId('dropdown-menu-item');
      expect(item).toHaveAttribute('disabled');
    });
  });
});
