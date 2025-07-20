'use client';

import { SimpleSportsPage } from '@/app/components/sports';

export default function MLSPage() {
  return (
    <SimpleSportsPage title="MLS" description="Major League Soccer - Live scores, stats, and more">
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p>Welcome to Major League Soccer</p>
      </div>
    </SimpleSportsPage>
  );
}
