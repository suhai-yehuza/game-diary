'use client';

import { SignUp } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';

export default function ClerkSignUp() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Fix footer alignment for Clerk components
    const fixFooterAlignment = () => {
      const footerAction = document.querySelector('[data-testid="footer-action"]') as HTMLElement;
      if (footerAction) {
        footerAction.setAttribute(
          'style',
          'display: flex !important; align-items: center !important; justify-content: center !important; gap: 0.5rem !important;'
        );

        // Handle child elements
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

    // Set up timeout to fix footer alignment
    timeoutRef.current = setTimeout(fixFooterAlignment, 100);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8" data-testid="clerk-sign-up">
        <SignUp />
      </div>
    </div>
  );
}
