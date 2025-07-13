'use client';

import { ClerkProvider, useUser, useAuth } from '@clerk/nextjs';
import type { ReactNode } from 'react';

export { ClerkProvider, useUser, useAuth };

export function ClerkProviderWrapper({ children }: { children: ReactNode }) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
