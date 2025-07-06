import dynamic from 'next/dynamic';

// Lazy loading component for Header
export const LazyHeader = dynamic(
  () => import('@/app/components/layout/header').then(mod => ({ default: mod.Header })),
  {
    loading: () => (
      <div className="w-full border-b lg:border-b">
        <div className="grid grid-cols-[auto_1fr_auto] h-16 items-center w-full">
          <div className="pl-10 flex items-center">
            <div className="w-11 h-11 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex justify-center">
            <div className="h-16 flex items-center">
              <div className="hidden lg:block space-x-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </div>
          <div className="pr-10 flex items-center gap-2 sm:gap-4 justify-end">
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    ),
    ssr: true,
  }
);

// Lazy loading component for TestHeader
export const LazyTestHeader = dynamic(
  () => import('@/app/components/layout/test-header').then(mod => ({ default: mod.TestHeader })),
  {
    loading: () => (
      <div className="w-full border-b lg:border-b">
        <div className="grid grid-cols-[auto_1fr_auto] h-16 items-center w-full">
          <div className="pl-10 flex items-center">
            <div className="w-11 h-11 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex justify-center">
            <div className="h-16 flex items-center">
              <div className="hidden lg:block space-x-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </div>
          <div className="pr-10 flex items-center gap-2 sm:gap-4 justify-end">
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    ),
    ssr: true,
  }
);
