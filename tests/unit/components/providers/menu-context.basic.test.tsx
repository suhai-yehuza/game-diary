import { render, screen, fireEvent } from '@testing-library/react';
import { createContext } from 'react';
import { vi } from 'vitest';

import { MenuProvider, useMenuContext } from '@/app/components/providers/MenuContext';

// Mock the context
const _MockMenuContext = createContext<{
  isMenuExpanded: boolean;
  setIsMenuExpanded: (expanded: boolean) => void;
}>({
  isMenuExpanded: false,
  setIsMenuExpanded: vi.fn(),
});

// Test component that uses the context
function TestComponent() {
  const { isMenuExpanded, setIsMenuExpanded } = useMenuContext();

  return (
    <div>
      <span data-testid="menu-state">{isMenuExpanded ? 'expanded' : 'collapsed'}</span>
      <button data-testid="toggle-menu" onClick={() => setIsMenuExpanded(!isMenuExpanded)}>
        Toggle Menu
      </button>
    </div>
  );
}

describe('MenuContext', () => {
  describe('MenuProvider', () => {
    it('provides menu context to children', () => {
      render(
        <MenuProvider>
          <TestComponent />
        </MenuProvider>
      );

      expect(screen.getByTestId('menu-state')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-menu')).toBeInTheDocument();
    });

    it('initializes with collapsed menu state', () => {
      render(
        <MenuProvider>
          <TestComponent />
        </MenuProvider>
      );

      expect(screen.getByTestId('menu-state')).toHaveTextContent('collapsed');
    });

    it('allows toggling menu state', () => {
      render(
        <MenuProvider>
          <TestComponent />
        </MenuProvider>
      );

      const toggleButton = screen.getByTestId('toggle-menu');
      const menuState = screen.getByTestId('menu-state');

      // Initially collapsed
      expect(menuState).toHaveTextContent('collapsed');

      // Toggle to expanded
      fireEvent.click(toggleButton);
      expect(menuState).toHaveTextContent('expanded');

      // Toggle back to collapsed
      fireEvent.click(toggleButton);
      expect(menuState).toHaveTextContent('collapsed');
    });

    it('maintains state across re-renders', () => {
      const { rerender } = render(
        <MenuProvider>
          <TestComponent />
        </MenuProvider>
      );

      const toggleButton = screen.getByTestId('toggle-menu');
      const menuState = screen.getByTestId('menu-state');

      // Toggle to expanded
      fireEvent.click(toggleButton);
      expect(menuState).toHaveTextContent('expanded');

      // Re-render
      rerender(
        <MenuProvider>
          <TestComponent />
        </MenuProvider>
      );

      // State should be maintained
      expect(screen.getByTestId('menu-state')).toHaveTextContent('expanded');
    });

    it('provides consistent context values', () => {
      let capturedContext: any = null;

      function ContextCapture() {
        capturedContext = useMenuContext();
        return null;
      }

      render(
        <MenuProvider>
          <ContextCapture />
        </MenuProvider>
      );

      expect(capturedContext).toBeDefined();
      expect(typeof capturedContext.isMenuExpanded).toBe('boolean');
      expect(typeof capturedContext.setIsMenuExpanded).toBe('function');
    });

    it('handles multiple state changes correctly', () => {
      render(
        <MenuProvider>
          <TestComponent />
        </MenuProvider>
      );

      const toggleButton = screen.getByTestId('toggle-menu');
      const menuState = screen.getByTestId('menu-state');

      // Multiple rapid toggles
      fireEvent.click(toggleButton); // expanded
      fireEvent.click(toggleButton); // collapsed
      fireEvent.click(toggleButton); // expanded
      fireEvent.click(toggleButton); // collapsed

      expect(menuState).toHaveTextContent('collapsed');
    });

    it('works with multiple child components', () => {
      function SecondTestComponent() {
        const { isMenuExpanded } = useMenuContext();
        return (
          <div data-testid="second-component">{isMenuExpanded ? 'expanded' : 'collapsed'}</div>
        );
      }

      render(
        <MenuProvider>
          <TestComponent />
          <SecondTestComponent />
        </MenuProvider>
      );

      const toggleButton = screen.getByTestId('toggle-menu');

      // Both components should show collapsed initially
      expect(screen.getByTestId('menu-state')).toHaveTextContent('collapsed');
      expect(screen.getByTestId('second-component')).toHaveTextContent('collapsed');

      // Toggle and both should update
      fireEvent.click(toggleButton);
      expect(screen.getByTestId('menu-state')).toHaveTextContent('expanded');
      expect(screen.getByTestId('second-component')).toHaveTextContent('expanded');
    });
  });

  describe('useMenuContext', () => {
    it('provides correct context structure', () => {
      let contextValue: any = null;

      function ContextTest() {
        contextValue = useMenuContext();
        return null;
      }

      render(
        <MenuProvider>
          <ContextTest />
        </MenuProvider>
      );

      expect(contextValue).toHaveProperty('isMenuExpanded');
      expect(contextValue).toHaveProperty('setIsMenuExpanded');
      expect(typeof contextValue.isMenuExpanded).toBe('boolean');
      expect(typeof contextValue.setIsMenuExpanded).toBe('function');
    });
  });
});
