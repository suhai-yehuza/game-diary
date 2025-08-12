import { render, screen } from '@testing-library/react';
import React from 'react';

import AuthGuard from '@/app/protected/AuthGuard';

vi.mock('next/dynamic', () => ({
  default: (loader: any, opts: any) => {
    const Comp = () => <div data-testid="client-auth-guard">{opts?.loading?.()}</div>;
    // mimic dynamic(() => import('...'), { ssr:false, loading }) returning loaded component immediately
    return Comp as any;
  },
}));

describe('AuthGuard (extended)', () => {
  it('renders loading fallback from dynamic import', () => {
    render(
      <AuthGuard>
        <div>children</div>
      </AuthGuard>
    );
    expect(screen.getByText('Loading authentication...')).toBeInTheDocument();
  });
});
