'use client';

import React from 'react';

export default function LiveGamesPage() {
  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-3xl font-bold">This will be the Live Games page</h1>
        <UserGreeting />
      </div>
    </section>
  );
}

function UserGreeting() {
  return <p>Welcome, User!</p>;
}
