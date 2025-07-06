'use client';

import React from 'react';

export default function MLBPage() {
  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-3xl font-bold">This will be the MLB page</h1>
        <UserGreeting />
      </div>
    </section>
  );
}

function UserGreeting() {
  return <p>Welcome, User!</p>;
}

export function MLBSportsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold">MLB</h1>
        <p className="text-muted-foreground">Major League Baseball games and statistics.</p>
      </div>
    </div>
  );
}
