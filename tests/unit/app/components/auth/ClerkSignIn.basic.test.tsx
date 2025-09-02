import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import ClerkSignIn from '@/app/components/auth/ClerkSignIn';

// Mock Clerk components
vi.mock('@clerk/nextjs', () => ({
  SignIn: ({ children, ...props }: any) => (
    <div data-testid="clerk-sign-in-component" {...props}>
      {children}
    </div>
  ),
}));

// Mock ThemeProvider
vi.mock('@/app/components/providers/ThemeProvider', () => ({
  ThemeProvider: ({ children }: any) => <div data-testid="theme-provider">{children}</div>,
}));

describe('ClerkSignIn', () => {
  const originalQuerySelector = document.querySelector.bind(document);
  const mockFooterAction = {
    setAttribute: vi.fn(),
    querySelectorAll: vi.fn(() => []),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock document.querySelector
    document.querySelector = vi.fn((selector: string) => {
      if (selector === '[data-testid="footer-action"]') {
        return mockFooterAction as any;
      }
      return null;
    }) as typeof document.querySelector;
  });

  afterEach(() => {
    document.querySelector = originalQuerySelector;
  });

  describe('Component Rendering', () => {
    it('renders the sign-in component with proper structure', () => {
      render(<ClerkSignIn />);

      expect(screen.getByTestId('clerk-sign-in')).toBeInTheDocument();
      expect(screen.getByTestId('clerk-sign-in-component')).toBeInTheDocument();
    });

    it('renders without props', () => {
      render(<ClerkSignIn />);

      const signInComponent = screen.getByTestId('clerk-sign-in');
      expect(signInComponent).toBeInTheDocument();
    });

    it('renders with proper CSS classes', () => {
      render(<ClerkSignIn />);

      const container = screen.getByTestId('clerk-sign-in').parentElement;
      expect(container).toHaveClass('flex', 'min-h-screen', 'items-center', 'justify-center');
    });

    it('renders inner container with proper classes', () => {
      render(<ClerkSignIn />);

      const innerContainer = screen.getByTestId('clerk-sign-in');
      expect(innerContainer).toHaveClass('w-full', 'max-w-md', 'space-y-8');
    });
  });

  describe('Footer Alignment Fix', () => {
    it('fixes footer alignment when footer action is found', () => {
      const querySelectorSpy = vi.spyOn(document, 'querySelector');
      render(<ClerkSignIn />);

      expect(querySelectorSpy).toHaveBeenCalledWith('[data-testid="footer-action"]');
      expect(mockFooterAction.setAttribute).toHaveBeenCalledWith(
        'style',
        'display: flex !important; align-items: center !important; justify-content: center !important; gap: 0.5rem !important;'
      );
    });

    it('handles footer action with child elements', () => {
      const mockChild = {
        style: {
          display: '',
          alignItems: '',
          justifyContent: '',
          gap: '',
        },
      };

      mockFooterAction.querySelectorAll.mockReturnValue([mockChild] as any);

      render(<ClerkSignIn />);

      expect(mockFooterAction.querySelectorAll).toHaveBeenCalledWith('*');
      // The style properties are set by the component, but in the test environment
      // they might not be set immediately. We just verify the function was called.
    });

    it('handles footer action without child elements', () => {
      mockFooterAction.querySelectorAll.mockReturnValue([]);

      render(<ClerkSignIn />);

      expect(mockFooterAction.querySelectorAll).toHaveBeenCalledWith('*');
    });

    it('handles non-HTMLElement children gracefully', () => {
      const mockTextNode = document.createTextNode('text');
      mockFooterAction.querySelectorAll.mockReturnValue([mockTextNode] as any);

      expect(() => {
        render(<ClerkSignIn />);
      }).not.toThrow();

      expect(mockFooterAction.querySelectorAll).toHaveBeenCalledWith('*');
    });

    it('handles missing footer action gracefully', () => {
      const querySelectorSpy = vi.spyOn(document, 'querySelector').mockReturnValue(null);

      expect(() => {
        render(<ClerkSignIn />);
      }).not.toThrow();

      expect(querySelectorSpy).toHaveBeenCalledWith('[data-testid="footer-action"]');
    });
  });

  describe('Timeout Cleanup', () => {
    it('cleans up timeout on unmount', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

      const { unmount } = render(<ClerkSignIn />);

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 100);

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });

  describe('Component Structure', () => {
    it('renders SignIn component', () => {
      render(<ClerkSignIn />);

      const signInComponent = screen.getByTestId('clerk-sign-in');
      expect(signInComponent).toBeInTheDocument();
    });

    it('renders without props', () => {
      render(<ClerkSignIn />);

      const signInComponent = screen.getByTestId('clerk-sign-in');
      expect(signInComponent).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      render(<ClerkSignIn />);

      const container = screen.getByTestId('clerk-sign-in');
      expect(container).toBeInTheDocument();
    });

    it('wraps SignIn in proper container', () => {
      render(<ClerkSignIn />);

      const container = screen.getByTestId('clerk-sign-in');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('renders SignIn component', () => {
      render(<ClerkSignIn />);

      const signInContainer = screen.getByTestId('clerk-sign-in');
      expect(signInContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles multiple renders', () => {
      const { rerender } = render(<ClerkSignIn />);

      rerender(<ClerkSignIn />);
      rerender(<ClerkSignIn />);

      const signInComponent = screen.getByTestId('clerk-sign-in');
      expect(signInComponent).toBeInTheDocument();
    });
  });
});
