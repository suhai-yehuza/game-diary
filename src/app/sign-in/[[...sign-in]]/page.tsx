'use client';

import { SignIn } from '@clerk/nextjs';
import React from 'react';

import { AuthModal } from '@/components/auth/AuthModal';

export default function Page() {
  return (
    <AuthModal>
      <SignIn
        routing="hash"
        appearance={{
          elements: {
            modalBackdrop: 'bg-transparent',
            modalContent: 'w-full max-w-md mx-auto',
          },
        }}
      />
    </AuthModal>
  );
}
