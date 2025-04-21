'use client';

import React from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function NotFoundContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">404 - Page Not Found</h1>
      {searchQuery && (
        <p className="text-gray-600">No results found for &quot;{searchQuery}&quot;</p>
      )}
    </div>
  );
}

export default function NotFound() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <NotFoundContent />
    </Suspense>
  );
}
