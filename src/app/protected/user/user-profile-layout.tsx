import React from 'react';

/**
 * Props for the UserProfileLayout component
 */
interface IUserProfileLayoutProps {
  /** The title to display at the top of the profile page */
  title: string;
  /** The content to render inside the layout */
  children: React.ReactNode;
}

/**
 * A layout component that provides a consistent structure for user profile pages.
 * It includes a title and a card container for the main content.
 */
export default function UserProfileLayout({ title, children }: IUserProfileLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-foreground">{title}</h1>
          <div className="bg-card text-card-foreground rounded-lg shadow-md p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
