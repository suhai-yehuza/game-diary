'use client';

import { SignIn } from '@clerk/nextjs';
import { useEffect } from 'react';

import { CLERK_THEME } from '@/lib/config/clerkTheme';

export default function ClerkSignIn() {
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

    // Run immediately and also after a short delay to catch dynamic content
    fixFooterAlignment();
    const timer = setTimeout(() => {
      fixFooterAlignment();
    }, 100);

    // Also run when the modal content changes
    const observer = new MutationObserver(() => {
      fixFooterAlignment();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return (
    <SignIn
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
      signUpUrl="/sign-up"
    />
  );
}
