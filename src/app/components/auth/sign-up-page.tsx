'use client';

import { SignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import React, { useEffect, useRef, useCallback, Suspense, Component } from 'react';

import { isUnitTestEnvironment } from '@/lib/config/api.config';

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
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const handleClose = useCallback(() => {
    router.push('/');
  }, [router]);

  useEffect(() => {
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
  }, [handleClose]);

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
  // Use a simple fallback for unit test environment only
  if (isUnitTestEnvironment) {
    return <div>Authentication temporarily unavailable</div>;
  }

  return <SignUp />;
}
