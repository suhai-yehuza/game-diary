'use client';

import { SignInButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

import type { ISignInModalTriggerProps } from '@/lib/types';

export default function SignInModalTrigger({ autoTrigger = false }: ISignInModalTriggerProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Auto-trigger the modal if explicitly requested or if we're in a specific context
    const hash = window.location.hash;
    const shouldAutoClick = autoTrigger ?? (hash && hash !== '#');

    if (shouldAutoClick) {
      // Small delay to ensure the component is fully mounted
      const timer = setTimeout(() => {
        buttonRef.current?.click();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [autoTrigger, router]);

  useEffect(() => {
    // Only set up the interval if we're auto-triggering
    if (!autoTrigger) return;

    const interval = setInterval(() => {
      // Clerk modal usually has a class like .cl-modal or data-testid="sign-in-modal"
      const modalPresent = document.querySelector('[data-testid="sign-in-modal"], .cl-modal');
      if (!modalPresent) {
        // If modal is closed and we're on a protected route, redirect to home
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/protected')) {
          router.push('/');
        }
      }
    }, 200);

    return () => {
      clearInterval(interval);
    };
  }, [autoTrigger, router]);

  // Force secondary links to be black in the modal
  useEffect(() => {
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
            console.log('Forced black color for:', text); // Debug log
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
          console.log('Forced black color for exact match:', text); // Debug log
        }
      });
    };

    // Run when modal content changes
    const observer = new MutationObserver(() => {
      fixSecondaryLinks();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Also run immediately and after a delay
    fixSecondaryLinks();
    const timer = setTimeout(fixSecondaryLinks, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return (
    <SignInButton mode="modal">
      <span ref={buttonRef} style={{ display: 'none' }} aria-hidden="true" />
    </SignInButton>
  );
}
