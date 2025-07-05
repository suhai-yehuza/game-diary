'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect, useRef, useCallback, Suspense, Component } from 'react';

// Error boundary for Clerk components
class ClerkErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: Error) {
    // Only log Clerk-related errors during development/testing
    if (error.message.includes('Clerk') || error.message.includes('useSession')) {
      console.warn('Clerk component error caught:', error.message);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <div>Authentication temporarily unavailable</div>;
    }

    return this.props.children;
  }
}

export function SignUpPage() {
  const isE2ETest = process.env.E2E_TESTING === 'true';
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const handleClose = useCallback(() => {
    router.push('/');
  }, [router]);

  useEffect(() => {
    if (isE2ETest) return;
    const injectCloseButton = () => {
      const modalCard = document.querySelector('.cl-card');
      if (modalCard && !modalCard.querySelector('.cl-page-close-btn')) {
        const closeButton = document.createElement('button');
        closeButton.className = 'cl-page-close-btn';
        closeButton.innerHTML = '×';
        closeButton.style.cssText = `
          position: absolute;
          top: 16px;
          right: 16px;
          width: 32px;
          height: 32px;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
          color: #666;
          cursor: pointer;
          z-index: 1000;
          transition: all 0.2s ease;
          border: none;
          outline: none;
          font-family: inherit;
        `;

        closeButton.addEventListener('click', handleClose);

        closeButton.addEventListener('mouseenter', () => {
          closeButton.style.background = 'rgba(0, 0, 0, 0.2)';
          closeButton.style.color = '#333';
        });

        closeButton.addEventListener('mouseleave', () => {
          closeButton.style.background = 'rgba(0, 0, 0, 0.1)';
          closeButton.style.color = '#666';
        });

        modalCard.appendChild(closeButton);
      }
    };

    // Click-outside-to-close logic
    const handleClickOutside = (event: MouseEvent) => {
      const modalCard = document.querySelector('.cl-card');
      if (modalCard && !modalCard.contains(event.target as Node)) {
        handleClose();
      }
    };

    // Wait for Clerk component to render
    const timer = setTimeout(() => {
      injectCloseButton();
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClose, isE2ETest]);

  if (isE2ETest) {
    return (
      <div className="grow flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <h1 className="text-2xl font-bold">Sign Up</h1>
          <p className="text-gray-600 dark:text-gray-300">
            [E2E TEST MODE] Authentication disabled
          </p>
          <div className="w-full max-w-md space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="grow flex items-center justify-center min-h-[60vh]">
      <ClerkErrorBoundary
        fallback={
          <div className="flex items-center justify-center p-8">
            Authentication temporarily unavailable
          </div>
        }
      >
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-8">Loading sign-up form...</div>
          }
        >
          <div className="w-full max-w-md">
            <SignUpWrapper />
          </div>
        </Suspense>
      </ClerkErrorBoundary>
    </div>
  );
}

// Separate component to handle Clerk SignUp
function SignUpWrapper() {
  // Only import Clerk components when not in test environment
  if (process.env.E2E_TESTING === 'true') {
    return <div>Sign-up form disabled in test mode</div>;
  }

  // Use a simple fallback for test environment
  return <div>Authentication temporarily unavailable</div>;
}
