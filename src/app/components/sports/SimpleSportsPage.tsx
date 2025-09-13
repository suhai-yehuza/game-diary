import React from 'react';

import type { ISimpleSportsPageProps } from '@/types';

export function SimpleSportsPage({ title, description, children }: ISimpleSportsPageProps) {
  return (
    <section className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-theme-muted mb-6">{description}</p>
        {children}
      </div>
    </section>
  );
}
