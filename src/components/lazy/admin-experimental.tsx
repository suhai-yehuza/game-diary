import dynamic from 'next/dynamic';

// Lazy loading component for AdminExperimentalPage
export const LazyAdminExperimentalPage = dynamic(
  () => import('@/app/protected/admin/experimental/page'),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading admin panel...</p>
        </div>
      </div>
    ),
    ssr: false,
  }
);
