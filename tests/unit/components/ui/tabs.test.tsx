import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/Tabs';

// Mock Radix UI Tabs
vi.mock('@radix-ui/react-tabs', () => ({
  Root: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    [key: string]: unknown;
  }) => (
    <div data-testid="tabs-root" className={className} {...props}>
      {children}
    </div>
  ),
  List: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    [key: string]: unknown;
  }) => (
    <div data-testid="tabs-list" className={className} {...props}>
      {children}
    </div>
  ),
  Trigger: ({
    children,
    value,
    className,
    ...props
  }: {
    children: React.ReactNode;
    value: string;
    className?: string;
    [key: string]: unknown;
  }) => (
    <button data-testid="tabs-trigger" data-value={value} className={className} {...props}>
      {children}
    </button>
  ),
  Content: ({
    children,
    value,
    className,
    ...props
  }: {
    children: React.ReactNode;
    value: string;
    className?: string;
    [key: string]: unknown;
  }) => (
    <div data-testid="tabs-content" data-value={value} className={className} {...props}>
      {children}
    </div>
  ),
}));

describe('Tabs Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Tabs', () => {
    it('renders tabs root with correct props', () => {
      const handleValueChange = vi.fn();

      render(
        <Tabs value="tab1" onValueChange={handleValueChange} className="custom-class">
          <div>Content</div>
        </Tabs>
      );

      const tabsRoot = screen.getByTestId('tabs-root');
      expect(tabsRoot).toBeInTheDocument();
      expect(tabsRoot).toHaveClass('custom-class');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();

      render(
        <Tabs ref={ref} value="tab1">
          <div>Content</div>
        </Tabs>
      );

      expect(ref).toHaveBeenCalled();
    });
  });

  describe('TabsList', () => {
    it('renders tabs list with correct styling', () => {
      render(
        <TabsList className="custom-list-class">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      );

      const tabsList = screen.getByTestId('tabs-list');
      expect(tabsList).toBeInTheDocument();
      expect(tabsList).toHaveClass('custom-list-class');
      expect(tabsList).toHaveClass(
        'inline-flex',
        'h-10',
        'items-center',
        'justify-center',
        'rounded-md',
        'bg-muted',
        'p-1',
        'text-muted-foreground'
      );
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();

      render(
        <TabsList ref={ref}>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      );

      expect(ref).toHaveBeenCalled();
    });
  });

  describe('TabsTrigger', () => {
    it('renders tabs trigger with correct props', () => {
      render(
        <TabsTrigger value="tab1" className="custom-trigger-class">
          Tab 1
        </TabsTrigger>
      );

      const tabsTrigger = screen.getByTestId('tabs-trigger');
      expect(tabsTrigger).toBeInTheDocument();
      expect(tabsTrigger).toHaveAttribute('data-value', 'tab1');
      expect(tabsTrigger).toHaveClass('custom-trigger-class');
      expect(tabsTrigger).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center',
        'whitespace-nowrap',
        'rounded-sm',
        'px-3',
        'py-1.5',
        'text-sm',
        'font-medium'
      );
      expect(tabsTrigger).toHaveTextContent('Tab 1');
    });

    it('handles click events', () => {
      const handleClick = vi.fn();

      render(
        <TabsTrigger value="tab1" onClick={handleClick}>
          Tab 1
        </TabsTrigger>
      );

      const tabsTrigger = screen.getByTestId('tabs-trigger');
      fireEvent.click(tabsTrigger);

      expect(handleClick).toHaveBeenCalled();
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();

      render(
        <TabsTrigger ref={ref} value="tab1">
          Tab 1
        </TabsTrigger>
      );

      expect(ref).toHaveBeenCalled();
    });

    it('applies disabled state correctly', () => {
      render(
        <TabsTrigger value="tab1" disabled>
          Tab 1
        </TabsTrigger>
      );

      const tabsTrigger = screen.getByTestId('tabs-trigger');
      expect(tabsTrigger).toBeDisabled();
    });
  });

  describe('TabsContent', () => {
    it('renders tabs content with correct props', () => {
      render(
        <TabsContent value="tab1" className="custom-content-class">
          Content for Tab 1
        </TabsContent>
      );

      const tabsContent = screen.getByTestId('tabs-content');
      expect(tabsContent).toBeInTheDocument();
      expect(tabsContent).toHaveAttribute('data-value', 'tab1');
      expect(tabsContent).toHaveClass('custom-content-class');
      expect(tabsContent).toHaveClass(
        'mt-2',
        'ring-offset-background',
        'focus-visible:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-ring',
        'focus-visible:ring-offset-2'
      );
      expect(tabsContent).toHaveTextContent('Content for Tab 1');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();

      render(
        <TabsContent ref={ref} value="tab1">
          Content
        </TabsContent>
      );

      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Complete Tabs Integration', () => {
    it('renders complete tabs structure', () => {
      render(
        <Tabs value="tab1" onValueChange={vi.fn()}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      expect(screen.getByTestId('tabs-root')).toBeInTheDocument();
      expect(screen.getByTestId('tabs-list')).toBeInTheDocument();
      expect(screen.getAllByTestId('tabs-trigger')).toHaveLength(2);
      expect(screen.getAllByTestId('tabs-content')).toHaveLength(2);

      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Tab 2')).toBeInTheDocument();
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('handles multiple triggers and content', () => {
      render(
        <Tabs value="tab1">
          <TabsList>
            <TabsTrigger value="tab1">First Tab</TabsTrigger>
            <TabsTrigger value="tab2">Second Tab</TabsTrigger>
            <TabsTrigger value="tab3">Third Tab</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">First Content</TabsContent>
          <TabsContent value="tab2">Second Content</TabsContent>
          <TabsContent value="tab3">Third Content</TabsContent>
        </Tabs>
      );

      const triggers = screen.getAllByTestId('tabs-trigger');
      const contents = screen.getAllByTestId('tabs-content');

      expect(triggers).toHaveLength(3);
      expect(contents).toHaveLength(3);

      expect(triggers[0]).toHaveAttribute('data-value', 'tab1');
      expect(triggers[1]).toHaveAttribute('data-value', 'tab2');
      expect(triggers[2]).toHaveAttribute('data-value', 'tab3');

      expect(contents[0]).toHaveAttribute('data-value', 'tab1');
      expect(contents[1]).toHaveAttribute('data-value', 'tab2');
      expect(contents[2]).toHaveAttribute('data-value', 'tab3');
    });
  });

  describe('Accessibility', () => {
    it('supports keyboard navigation', () => {
      render(
        <Tabs value="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const triggers = screen.getAllByTestId('tabs-trigger');

      // Should be focusable
      triggers[0].focus();
      expect(triggers[0]).toHaveFocus();
    });

    it('supports disabled state', () => {
      render(
        <Tabs value="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" disabled>
              Tab 2
            </TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const disabledTrigger = screen.getByText('Tab 2').closest('button');
      expect(disabledTrigger).toBeDisabled();
    });
  });
});
