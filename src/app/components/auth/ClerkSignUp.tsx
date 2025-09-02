'use client';

import { SignUp } from '@clerk/nextjs';
import { useEffect } from 'react';

export default function ClerkSignUp() {
  useEffect(() => {
    // Force footer alignment after component mounts
    const fixFooterAlignment = () => {
      const footerAction = document.querySelector('[data-testid="footer-action"]');
      if (footerAction) {
        footerAction.setAttribute(
          'style',
          'display: flex !important; align-items: center !important; justify-content: center !important; gap: 0.5rem !important;'
        );

        // Also fix child elements
        const children = footerAction.querySelectorAll('*');
        children.forEach(child => {
          if (child instanceof HTMLElement) {
            child.style.display = 'flex';
            child.style.alignItems = 'center';
            child.style.justifyContent = 'center';
            child.style.gap = '0.5rem';
          }
        });
      }
    };

    // Run immediately and also after a short delay to ensure DOM is ready
    fixFooterAlignment();
    const timeoutId = setTimeout(fixFooterAlignment, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8" data-testid="clerk-sign-up">
        <SignUp />
      </div>
    </div>
  );
}
