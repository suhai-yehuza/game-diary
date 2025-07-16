import React from 'react';

import { Footer } from '@src/app/components/layout';
import { ClientProviders } from '@src/app/components/providers';

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientProviders>
      <main className="grow">{children}</main>
      <Footer />
    </ClientProviders>
  );
}
