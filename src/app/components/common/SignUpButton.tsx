'use client';

import { SignUpButton as ClerkSignUpButton } from '@clerk/nextjs';
import React from 'react';

export function AppSignUpButton(props: React.ComponentProps<typeof ClerkSignUpButton>) {
  return <ClerkSignUpButton mode="modal" {...props} />;
}
