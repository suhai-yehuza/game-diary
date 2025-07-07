'use client';

import { useClerk } from '@clerk/nextjs';
import { useEffect, useRef, useState } from 'react';

import type { ISignInButtonProps } from '@/lib/types/componentTypes';

export function SignInButton({ children, className, ...props }: ISignInButtonProps) {
  const clerk = (useClerk as () => { openSignIn: () => void } | null)();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleSignIn = () => {
    if (clerk?.openSignIn) {
      setIsModalOpen(true);
      clerk.openSignIn();
    }
  };

  // Handle click outside to close modal (no X injection)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (isModalOpen && modalRef.current && !modalRef.current.contains(target)) {
        if (clerk?.openSignIn) {
          clerk.openSignIn();
        }
        setIsModalOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (isModalOpen && event.key === 'Escape') {
        if (clerk?.openSignIn) {
          clerk.openSignIn();
        }
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isModalOpen, clerk]);

  return (
    <div ref={modalRef}>
      <button
        type="button"
        onClick={handleSignIn}
        className={className}
        data-testid="sign-in-button"
        {...props}
      >
        {children}
      </button>
    </div>
  );
}
