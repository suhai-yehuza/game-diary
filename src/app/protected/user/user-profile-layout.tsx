import React from 'react';

import type { IUserProfileLayoutProps } from '@src/lib/types';

/**
 * A layout component that provides a consistent structure for user profile pages.
 * It includes a title and a card container for the main content.
 */
export default function UserProfileLayout({ title, children }: IUserProfileLayoutProps) {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-foreground">{title}</h1>
          <div className="bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] rounded-lg shadow-md p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
