'use client';

import { useClerk } from '@clerk/nextjs';
import { useEffect, useRef, useState } from 'react';

import type { ISignUpButtonProps } from '@/lib/types/componentTypes';

export function SignUpButton({ children, className, ...props }: ISignUpButtonProps) {
  const clerk = (useClerk as () => { openSignUp: () => void } | null)();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleSignUp = () => {
    if (clerk?.openSignUp) {
      setIsModalOpen(true);
      clerk.openSignUp();
    }
  };

  // Handle click outside to close modal (no X injection)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (isModalOpen && modalRef.current && !modalRef.current.contains(target)) {
        if (clerk?.openSignUp) {
          clerk.openSignUp();
        }
        setIsModalOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (isModalOpen && event.key === 'Escape') {
        if (clerk?.openSignUp) {
          clerk.openSignUp();
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
      <button type="button" onClick={handleSignUp} className={className} {...props}>
        {children}
      </button>
    </div>
  );
}
