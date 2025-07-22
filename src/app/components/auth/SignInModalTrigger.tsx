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

  // Force secondary links to be black in the modal
  useEffect(() => {
    // This effect has been removed to fix modal styling inconsistencies
    // The modal styling should be handled by Clerk's built-in appearance configuration
  }, []);

  return (
    <SignInButton mode="modal">
      <span ref={buttonRef} style={{ display: 'none' }} aria-hidden="true" tabIndex={-1} />
    </SignInButton>
  );
}
