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

    // Add accessibility attributes to buttons in Clerk modal
    const fixAccessibility = () => {
      // Find all buttons in the Clerk modal that don't have aria-label
      const buttons = document.querySelectorAll(
        '.cl-card button, .cl-modal button, [role="button"]'
      );
      buttons.forEach(button => {
        const element = button as HTMLElement;
        const hasAriaLabel = element.getAttribute('aria-label');
        const hasTextContent = element.textContent?.trim();

        // If button has no aria-label but has text content, use text content as aria-label
        if (!hasAriaLabel && hasTextContent) {
          element.setAttribute('aria-label', hasTextContent);
        }

        // If button has no aria-label and no text content, add a generic one based on context
        if (!hasAriaLabel && !hasTextContent) {
          // Try to determine button purpose from context
          const isCloseButton =
            element.closest('.cl-modal') &&
            (element.classList.contains('cl-modal-close-btn') ||
              element.getAttribute('data-testid')?.includes('close'));

          const isSubmitButton =
            (element as HTMLButtonElement).type === 'submit' ||
            element.classList.contains('cl-formButtonPrimary');

          const isLinkButton = element.tagName === 'A' || element.getAttribute('role') === 'link';

          if (isCloseButton) {
            element.setAttribute('aria-label', 'Close modal');
          } else if (isSubmitButton) {
            element.setAttribute('aria-label', 'Submit form');
          } else if (isLinkButton) {
            element.setAttribute('aria-label', 'Navigate to link');
          } else {
            element.setAttribute('aria-label', 'Button');
          }
        }
      });
    };

    // Run immediately and also after a short delay to catch dynamic content
    fixFooterAlignment();
    fixAccessibility();

    const timer = setTimeout(() => {
      fixFooterAlignment();
      fixAccessibility();
    }, 100);

    // Also run when the modal content changes
    const observer = new MutationObserver(() => {
      fixFooterAlignment();
      fixAccessibility();
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
