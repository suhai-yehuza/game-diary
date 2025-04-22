'use client';

import React from 'react';
import { SignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  return (
    <div
      className="fixed inset-0 flex justify-center pt-[4.5rem]"
      onClick={e => {
        // Only dismiss if clicking the backdrop (not the modal content), and redirect to the home page
        if (e.target === e.currentTarget) {
          router.push('/');
        }
      }}
    >
      <SignIn
        routing="hash"
        appearance={{
          elements: {
            modalBackdrop: 'bg-background/80',
            modalContent: 'w-full max-w-md mx-auto',
          },
        }}
      />
    </div>
  );
}
