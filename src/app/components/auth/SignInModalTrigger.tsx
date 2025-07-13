'use client';

import { SignInButton } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';

export default function SignInModalTrigger() {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    buttonRef.current?.click();
  }, []);

  return (
    <SignInButton mode="modal">
      <button ref={buttonRef} style={{ display: 'none' }} aria-hidden="true" />
    </SignInButton>
  );
}
