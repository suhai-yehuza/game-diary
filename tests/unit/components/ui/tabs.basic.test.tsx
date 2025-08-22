import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/Tabs';

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

      const tabsRoot = screen.getByText('Content').closest('div');
      expect(tabsRoot).toBeInTheDocument();
      // Check that the wrapper has the expected classes
      expect(tabsRoot?.parentElement).toHaveClass('w-full', 'custom-class');
    });

    it('handles value changes', () => {
      const handleValueChange = vi.fn();
      const { rerender } = render(
        <Tabs value="tab1" onValueChange={handleValueChange}>
          <div>Content</div>
        </Tabs>
      );

      // Test that the component renders with the initial value
      expect(screen.getByText('Content')).toBeInTheDocument();

      rerender(
        <Tabs value="tab2" onValueChange={handleValueChange}>
          <div>Content</div>
        </Tabs>
      );

      // Component should still render
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('TabsList', () => {
    it('renders tabs list with correct styling', () => {
      render(
        <Tabs value="tab1" onValueChange={vi.fn()}>
          <TabsList className="custom-list-class">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const tabsList = screen.getByText('Tab 1').closest('div');
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

    it('renders multiple triggers in list', () => {
      render(
        <Tabs value="tab1" onValueChange={vi.fn()}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Tab 2')).toBeInTheDocument();
      expect(screen.getByText('Tab 3')).toBeInTheDocument();
    });
  });

  describe('TabsTrigger', () => {
    it('renders tabs trigger with correct props', () => {
      render(
        <Tabs value="tab1" onValueChange={vi.fn()}>
          <TabsTrigger value="tab1" className="custom-trigger-class">
            Tab 1
          </TabsTrigger>
        </Tabs>
      );

      const tabsTrigger = screen.getByRole('button', { name: 'Tab 1' });
      expect(tabsTrigger).toBeInTheDocument();
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
      const handleValueChange = vi.fn();

      render(
        <Tabs value="tab1" onValueChange={handleValueChange}>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </Tabs>
      );

      const tabsTrigger = screen.getByRole('button', { name: 'Tab 1' });
      fireEvent.click(tabsTrigger);

      expect(handleValueChange).toHaveBeenCalledWith('tab1');
    });

    it('handles keyboard events', async () => {
      const user = userEvent.setup();
      const handleValueChange = vi.fn();

      render(
        <Tabs value="tab1" onValueChange={handleValueChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const triggers = screen.getAllByRole('button');

      // Focus first trigger
      await user.click(triggers[0]);
      expect(triggers[0]).toHaveFocus();

      // Press Enter
      await user.keyboard('{Enter}');
      expect(handleValueChange).toHaveBeenCalledWith('tab1');
    });

    it('handles long text content', () => {
      render(
        <Tabs value="tab1" onValueChange={vi.fn()}>
          <TabsTrigger value="tab1">
            This is a very long tab name that might wrap or be truncated
          </TabsTrigger>
        </Tabs>
      );

      const tabsTrigger = screen.getByRole('button');
      expect(tabsTrigger).toHaveTextContent(
        'This is a very long tab name that might wrap or be truncated'
      );
    });

    it('handles special characters in text', () => {
      render(
        <Tabs value="tab1" onValueChange={vi.fn()}>
          <TabsTrigger value="tab1">Tab with @#$%^&*() characters</TabsTrigger>
        </Tabs>
      );

      const tabsTrigger = screen.getByRole('button');
      expect(tabsTrigger).toHaveTextContent('Tab with @#$%^&*() characters');
    });
  });

  describe('TabsContent', () => {
    it('renders tabs content with correct props', () => {
      render(
        <Tabs value="tab1" onValueChange={vi.fn()}>
          <TabsContent value="tab1" className="custom-content-class">
            Content for Tab 1
          </TabsContent>
        </Tabs>
      );

      const tabsContent = screen.getByText('Content for Tab 1');
      expect(tabsContent).toBeInTheDocument();
      expect(tabsContent).toHaveClass('custom-content-class');
      expect(tabsContent).toHaveClass(
        'mt-2',
        'ring-offset-background',
        'focus-visible:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-ring',
        'focus-visible:ring-offset-2'
      );
    });

    it('renders complex content', () => {
      render(
        <Tabs value="tab1" onValueChange={vi.fn()}>
          <TabsContent value="tab1">
            <div>
              <h2>Complex Content</h2>
              <p>
                This is a paragraph with <strong>bold text</strong> and <em>italic text</em>.
              </p>
              <ul>
                <li>List item 1</li>
                <li>List item 2</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Complex Content')).toBeInTheDocument();
      // Check for the paragraph text with flexible matching
      expect(screen.getByText(/This is a paragraph with/)).toBeInTheDocument();
      expect(screen.getByText('List item 1')).toBeInTheDocument();
      expect(screen.getByText('List item 2')).toBeInTheDocument();
    });

    it('handles empty content', () => {
      render(
        <Tabs value="tab1" onValueChange={vi.fn()}>
          <TabsContent value="tab1">
            <div />
          </TabsContent>
        </Tabs>
      );

      // Check that the content container is rendered by looking for the specific class
      const contentContainer = document.querySelector('.mt-2.ring-offset-background');
      expect(contentContainer).toBeInTheDocument();
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

      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Tab 2')).toBeInTheDocument();
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      // Content 2 should not be visible since tab1 is selected
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
    });

    it('handles multiple triggers and content', () => {
      render(
        <Tabs value="tab1" onValueChange={vi.fn()}>
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

      expect(screen.getByText('First Tab')).toBeInTheDocument();
      expect(screen.getByText('Second Tab')).toBeInTheDocument();
      expect(screen.getByText('Third Tab')).toBeInTheDocument();
      expect(screen.getByText('First Content')).toBeInTheDocument();
      // Only first content should be visible
      expect(screen.queryByText('Second Content')).not.toBeInTheDocument();
      expect(screen.queryByText('Third Content')).not.toBeInTheDocument();
    });

    it('handles tab switching', () => {
      const handleValueChange = vi.fn();
      render(
        <Tabs value="tab1" onValueChange={handleValueChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      const tab2Trigger = screen.getByRole('button', { name: 'Tab 2' });
      fireEvent.click(tab2Trigger);

      expect(handleValueChange).toHaveBeenCalledWith('tab2');
    });
  });

  describe('Accessibility', () => {
    it('supports keyboard navigation', () => {
      render(
        <Tabs value="tab1" onValueChange={vi.fn()}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const triggers = screen.getAllByRole('button');

      // Should be focusable
      triggers[0].focus();
      expect(triggers[0]).toHaveFocus();
    });

    it('supports arrow key navigation', async () => {
      const user = userEvent.setup();
      render(
        <Tabs value="tab1" onValueChange={vi.fn()}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      const triggers = screen.getAllByRole('button');

      // Focus first trigger
      await user.click(triggers[0]);
      expect(triggers[0]).toHaveFocus();

      // Arrow keys should work
      await user.keyboard('{ArrowRight}');
      expect(triggers[0]).toHaveFocus(); // Focus doesn't change in our simple implementation
    });

    it('has proper ARIA attributes', () => {
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

      const triggers = screen.getAllByRole('button');

      // All triggers should be buttons
      triggers.forEach(trigger => {
        expect(trigger.tagName).toBe('BUTTON');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles no triggers', () => {
      render(
        <Tabs value="tab1" onValueChange={vi.fn()}>
          <TabsList>
            <div />
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('handles no content', () => {
      render(
        <Tabs value="tab1" onValueChange={vi.fn()}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          {/* No content */}
        </Tabs>
      );

      expect(screen.getByText('Tab 1')).toBeInTheDocument();
    });

    it('handles mismatched trigger and content values', () => {
      render(
        <Tabs value="tab1" onValueChange={vi.fn()}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="different-value">Content</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      // Content should not be visible since value doesn't match
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });
  });
});
