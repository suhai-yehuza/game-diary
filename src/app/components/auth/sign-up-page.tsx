'use client';

import { SignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useCallback, Suspense } from 'react';

export function SignUpPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    router.push('/');
  }, [router]);

  // Add X button and click-outside-to-close to the Clerk SignUp component
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
      <Suspense fallback={<div>Loading...</div>}>
        <SignUp />
      </Suspense>
    </div>
  );
}
