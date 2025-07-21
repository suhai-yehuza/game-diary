'use client';

import { SignInButton as ClerkSignInButton } from '@clerk/nextjs';
import React from 'react';

export function AppSignInButton(props: React.ComponentProps<typeof ClerkSignInButton>) {
  return <ClerkSignInButton mode="modal" {...props} />;
}
