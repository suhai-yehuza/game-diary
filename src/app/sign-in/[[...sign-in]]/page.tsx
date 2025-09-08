'use client';

import ClerkSignIn from '@/app/components/auth/ClerkSignIn';
import { ClerkProviderWrapper } from '@/app/components/providers/ClerkProvider';
import type { ISignInPageProps } from '@/types';

export default function SignInPage({ params: _params }: ISignInPageProps) {
  return (
    <ClerkProviderWrapper>
      <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">Welcome back! Please sign in to continue.</p>
          </div>
          <ClerkSignIn />
        </div>
      </div>
    </ClerkProviderWrapper>
  );
}
