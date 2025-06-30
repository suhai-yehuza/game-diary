import { SignIn } from '@clerk/nextjs';

import { ClerkProviderWrapper, ThemeProvider } from '@src/app/components/providers';

export default function SignInPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ClerkProviderWrapper>
        <div className="grow flex items-center justify-center min-h-[60vh]">
          <SignIn />
        </div>
      </ClerkProviderWrapper>
    </ThemeProvider>
  );
}
