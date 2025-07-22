'use client';

import { SignUp } from '@clerk/nextjs';
import { useEffect } from 'react';

import { CLERK_THEME } from '@/lib/config/clerkTheme';

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
        const children = footerAction.children;
        for (let i = 0; i < children.length; i++) {
          const child = children[i] as HTMLElement;
          child.style.margin = '0 !important';
          child.style.display = 'inline-block !important';
        }
      }
    };

    // Force secondary links to be black
    const fixSecondaryLinks = () => {
      // Target all links that are not the main button or footer action
      const allLinks = document.querySelectorAll('a, button, [role="button"]');
      allLinks.forEach(link => {
        const element = link as HTMLElement;
        const text = element.textContent?.toLowerCase() ?? '';

        // Check if this is a secondary link we want to make black
        if (
          text.includes('use phone') ||
          text.includes('use passkey') ||
          text.includes('sign up') ||
          text.includes('sign in') ||
          element.classList.contains('cl-formFieldAction') ||
          element.classList.contains('cl-formFieldActionLink') ||
          element.classList.contains('cl-alternativeMethodsBlockButton')
        ) {
          // Make sure it's not the main continue button or footer action
          if (
            !text.includes('continue') &&
            !element.classList.contains('cl-formButtonPrimary') &&
            !element.classList.contains('cl-footerActionLink')
          ) {
            element.style.color = '#000000 !important';
            element.style.setProperty('color', '#000000', 'important');
          }
        }

        // Additional targeting for specific text patterns
        if (
          text.trim() === 'use passkey instead' ||
          text.trim() === 'sign up' ||
          text.trim() === 'sign in'
        ) {
          element.style.color = '#000000 !important';
          element.style.setProperty('color', '#000000', 'important');
        }
      });
    };

    // Run immediately and also after a short delay to catch dynamic content
    fixFooterAlignment();
    fixSecondaryLinks();
    const timer = setTimeout(() => {
      fixFooterAlignment();
      fixSecondaryLinks();
    }, 100);

    // Also run when the modal content changes
    const observer = new MutationObserver(() => {
      fixFooterAlignment();
      fixSecondaryLinks();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return (
    <SignUp
      appearance={{
        elements: {
          rootBox: 'mx-auto',
          card: 'shadow-lg',
          footerAction: 'cl-footerAction',
          formButtonPrimary: CLERK_THEME.tailwind.button,
          footerActionLink: CLERK_THEME.tailwind.link,
          formFieldAction: CLERK_THEME.tailwind.secondaryLink,
          formFieldActionLink: CLERK_THEME.tailwind.secondaryLink,
          alternativeMethodsBlockButton: CLERK_THEME.tailwind.secondaryLink,
        },
      }}
      signInUrl="/sign-in"
    />
  );
}
