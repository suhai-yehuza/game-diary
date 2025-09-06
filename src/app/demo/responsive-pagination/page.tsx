'use client';

import { useState } from 'react';

import { useResponsivePagination } from '@/hooks/use-responsive-pagination';

// Generate mock data
const generateMockData = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    description: `This is a description for item ${i + 1}`,
  }));
};

export default function ResponsivePaginationDemo() {
  const [totalItems, setTotalItems] = useState(1000);
  const mockData = generateMockData(totalItems);

  const {
    currentPage,
    itemsPerPage,
    totalPages,
    currentItems,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    resetPagination,
    viewport,
  } = useResponsivePagination(mockData, {
    totalItems,
    minItemsPerPage: 10,
    maxItemsPerPage: 50,
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Responsive Pagination Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            This demo shows how pagination automatically adapts to different screen sizes. Try
            resizing your browser window to see the items per page change dynamically.
          </p>

          {/* Viewport Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Viewport</h3>
              <p className="text-blue-700 dark:text-blue-300">
                {viewport.width} × {viewport.height}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 dark:text-green-100">Items Per Page</h3>
              <p className="text-green-700 dark:text-green-300">{itemsPerPage}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">Total Pages</h3>
              <p className="text-purple-700 dark:text-purple-300">{totalPages}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Items:
              </label>
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={totalItems}
                onChange={e => setTotalItems(parseInt(e.target.value))}
                className="w-32"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 w-16">
                {totalItems.toLocaleString()}
              </span>
            </div>
            <button
              onClick={resetPagination}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Reset to Page 1
            </button>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              First
            </button>
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
            <button
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Last
            </button>
          </div>

          {/* Page Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    page === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            {totalPages > 10 && <span className="px-3 py-2 text-gray-500">...</span>}
          </div>
        </div>

        {/* Data Display */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Current Page Items ({currentItems.length} items)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentItems.map(item => (
              <div
                key={item.id}
                className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <h3 className="font-medium text-gray-900 dark:text-white">{item.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{item.description}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">ID: {item.id}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
