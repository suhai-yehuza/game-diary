'use client';

import { SimpleSportsPage } from '@/app/components/sports';

export default function NHLPage() {
  return (
    <SimpleSportsPage
      title="NHL"
      description="National Hockey League - Live scores, stats, and more"
    >
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p>Welcome to the National Hockey League</p>
      </div>
    </SimpleSportsPage>
  );
}
