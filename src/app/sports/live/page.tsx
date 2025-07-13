'use client';

import { useUser } from '@clerk/nextjs';

export default function LiveGamesPage() {
  const { isLoaded, isSignedIn, user } = useUser();

  let greeting;
  if (!isLoaded) {
    greeting = 'Loading...';
  } else if (isSignedIn) {
    greeting = `Welcome, ${user?.username ?? user?.firstName ?? 'User'}!`;
  } else {
    greeting = 'Welcome, Guest! (Not signed in)';
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Live Games page</h1>
      <p>{greeting}</p>
    </section>
  );
}
