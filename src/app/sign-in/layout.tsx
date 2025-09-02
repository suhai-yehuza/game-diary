import React from 'react';

import { Footer } from '@src/app/components/layout';

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="grow">{children}</main>
      <Footer />
    </>
  );
}
