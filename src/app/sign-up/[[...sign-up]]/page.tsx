'use client';

import { SignUp } from '@clerk/nextjs';
import React from 'react';

import { AuthModal } from '@src/app/components/auth/AuthModal';

export default function Page() {
  return (
    <AuthModal>
      <SignUp
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
