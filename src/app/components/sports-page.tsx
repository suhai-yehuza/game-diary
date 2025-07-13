'use client';

import React from 'react';

import type { ISportsPageProps } from '@/lib/types';

export function SportsPage({ title, userName, children }: ISportsPageProps) {
  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        {children ?? <UserGreeting userName={userName} />}
      </div>
    </section>
  );
}

function UserGreeting({ userName }: { userName?: string }) {
  if (userName === undefined) {
    return <p>Welcome, Guest! (No user data)</p>;
  }

  return <p>Welcome, {userName}!</p>;
}
