'use client';

import { useClerk } from '@clerk/nextjs';
import { useEffect, useRef, useState } from 'react';

import type { ISignInButtonProps } from '@/lib/types/componentTypes';

export function SignInButton({ children, className }: ISignInButtonProps) {
  const { openSignIn } = useClerk();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleSignIn = () => {
    setIsModalOpen(true);
    openSignIn();
  };

  // Handle click outside to close modal (no X injection)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (isModalOpen && modalRef.current && !modalRef.current.contains(target)) {
        openSignIn();
        setIsModalOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (isModalOpen && event.key === 'Escape') {
        openSignIn();
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
  }, [isModalOpen, openSignIn]);

  return (
    <div ref={modalRef}>
      <button type="button" onClick={handleSignIn} className={className}>
        {children}
      </button>
    </div>
  );
}
