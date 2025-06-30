import { SignUp } from '@clerk/nextjs';

import { Header, Footer } from '@src/app/components/layout';
import { ClerkProviderWrapper, ThemeProvider } from '@src/app/components/providers';

export default function SignUpPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ClerkProviderWrapper>
        <Header />
        <div className="grow flex items-center justify-center min-h-[60vh]">
          <SignUp />
        </div>
        <Footer />
      </ClerkProviderWrapper>
    </ThemeProvider>
  );
}
