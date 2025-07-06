'use client';

import React from 'react';

export default function NHLPage() {
  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-3xl font-bold">This will be the NHL page</h1>
        <UserGreeting />
      </div>
    </section>
  );
}

function UserGreeting() {
  return <p>Welcome, User!</p>;
}

export function NHLSportsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold">NHL</h1>
        <p className="text-muted-foreground">National Hockey League games and statistics.</p>
      </div>
    </div>
  );
}
