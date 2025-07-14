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
    const hash =
      typeof window !== 'undefined' && typeof window.location?.hash === 'string'
        ? window.location.hash
        : '';

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

  return (
    <SignInButton mode="modal">
      <button ref={buttonRef} style={{ display: 'none' }} aria-hidden="true" />
    </SignInButton>
  );
}
