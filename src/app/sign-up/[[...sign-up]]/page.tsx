import { SignUp } from '@clerk/nextjs';

import { ClerkProviderWrapper, ThemeProvider } from '@src/app/components/providers';

export default function SignUpPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ClerkProviderWrapper>
        <div className="grow flex items-center justify-center min-h-[60vh]">
          <SignUp />
        </div>
      </ClerkProviderWrapper>
    </ThemeProvider>
  );
}
