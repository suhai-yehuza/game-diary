'use client';

import ClerkSignUp from '@/app/components/auth/ClerkSignUp';
import { ClerkProviderWrapper } from '@/app/components/providers/ClerkProvider';
import type { ISignUpPageProps } from '@/lib/types';

export default function SignUpPage({ params: _params }: ISignUpPageProps) {
  return (
    <ClerkProviderWrapper>
      <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Join Game Diary to start tracking your sports experiences.
            </p>
          </div>
          <ClerkSignUp />
        </div>
      </div>
    </ClerkProviderWrapper>
  );
}
