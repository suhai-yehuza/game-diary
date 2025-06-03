'use client';

import { SignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import React, { useRef } from 'react';

export default function Page() {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      router.push('/');
    }
  };

  const handleBackdropKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      router.push('/');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-background/80"
        onClick={handleBackdropClick}
        onKeyDown={handleBackdropKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />
      <div ref={modalRef} className="relative z-10 w-full max-w-md mx-auto p-4">
        <SignUp
          routing="hash"
          appearance={{
            elements: {
              modalBackdrop: 'bg-transparent',
              modalContent: 'w-full max-w-md mx-auto',
            },
          }}
        />
      </div>
    </div>
  );
}
