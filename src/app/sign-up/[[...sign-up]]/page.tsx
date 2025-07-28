import { redirect } from 'next/navigation';

import ClerkSignUp from '@/app/components/auth/ClerkSignUp';
import type { ISignUpPageProps } from '@/lib/types';
import { isClerkCatchallRouteServer } from '@/lib/utils/sso-utils';

export default function SignUpPage({ params }: ISignUpPageProps) {
  // Handle Clerk catchall routes and SSO callbacks
  const signUpSegments = params['sign-up'] || [];

  // Check if this is a Clerk catchall route or SSO callback
  if (signUpSegments.length > 0) {
    const firstSegment = signUpSegments[0];

    // Handle SSO callback routes
    if (firstSegment === 'sso-callback') {
      // Redirect to the main SSO callback page
      redirect('/sso-callback');
    }

    // Handle other Clerk catchall routes by redirecting to the main sign-up page
    if (isClerkCatchallRouteServer(firstSegment)) {
      redirect('/sign-up');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join us and start tracking your favorite sports!
          </p>
        </div>
        <ClerkSignUp />
      </div>
    </div>
  );
}
