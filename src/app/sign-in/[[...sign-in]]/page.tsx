import { SignIn } from '@clerk/nextjs';

import { Header, Footer } from '@src/app/components/layout';
import { ClerkProviderWrapper, ThemeProvider } from '@src/app/components/providers';

export default function SignInPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ClerkProviderWrapper>
        <Header />
        <main className="grow flex items-center justify-center min-h-[60vh]">
          <SignIn />
        </main>
        <Footer />
      </ClerkProviderWrapper>
    </ThemeProvider>
  );
}
