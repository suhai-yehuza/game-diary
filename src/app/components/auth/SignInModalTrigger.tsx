'use client';

import { SignInButton, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

import type { ISignInModalTriggerProps } from '@/types';

export default function SignInModalTrigger({ autoTrigger = false }: ISignInModalTriggerProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { openSignIn } = useClerk();

  useEffect(() => {
    // Auto-trigger the modal if explicitly requested or if we're in a specific context
    const hash = window.location.hash;
    const shouldAutoClick = autoTrigger ?? (hash && hash !== '#');

    if (shouldAutoClick) {
      // Small delay to ensure the component is fully mounted
      const timer = setTimeout(() => {
        // Use the Clerk API to open the sign-in modal directly
        openSignIn();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [autoTrigger, router, openSignIn]);

  useEffect(() => {
    if (!autoTrigger) return;

    let redirected = false;
    const observer = new MutationObserver(() => {
      const modalPresent = document.querySelector('[data-testid="sign-in-modal"], .cl-modal');
      if (!modalPresent && !redirected) {
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/protected')) {
          redirected = true;
          router.push('/');
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [autoTrigger, router]);

  // Add accessibility attributes to buttons in Clerk modal
  useEffect(() => {
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
    fixAccessibility();

    const timer = setTimeout(() => {
      fixAccessibility();
    }, 100);

    // Also run when the modal content changes
    const observer = new MutationObserver(() => {
      fixAccessibility();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  // Force secondary links to be black in the modal
  useEffect(() => {
    // This effect has been removed to fix modal styling inconsistencies
    // The modal styling should be handled by Clerk's built-in appearance configuration
  }, []);

  return (
    <div ref={triggerRef}>
      <SignInButton mode="modal">
        <div
          className="px-4 py-2 bg-blue-800 text-white rounded-lg shadow-md hover:bg-blue-900 transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black cursor-pointer"
          role="button"
          tabIndex={0}
          aria-label="Sign In"
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.currentTarget.click();
            }
          }}
        >
          Sign In
        </div>
      </SignInButton>
    </div>
  );
}
