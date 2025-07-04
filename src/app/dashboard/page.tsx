import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Dashboard | Game Diary',
  description: 'Your personal game diary dashboard',
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your dashboard.</p>
      </div>
    </div>
  );
}
