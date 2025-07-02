'use client';

import { useClerk } from '@clerk/nextjs';
import { useEffect, useRef, useState } from 'react';

import type { ISignUpButtonProps } from '@/lib/types/componentTypes';

export function SignUpButton({ children, className }: ISignUpButtonProps) {
  const { openSignUp } = useClerk();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleSignUp = () => {
    setIsModalOpen(true);
    openSignUp();
  };

  // Handle click outside to close modal (no X injection)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (isModalOpen && modalRef.current && !modalRef.current.contains(target)) {
        openSignUp();
        setIsModalOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (isModalOpen && event.key === 'Escape') {
        openSignUp();
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
  }, [isModalOpen, openSignUp]);

  return (
    <div ref={modalRef}>
      <button type="button" onClick={handleSignUp} className={className}>
        {children}
      </button>
    </div>
  );
}
