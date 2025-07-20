'use client';

import { SimpleSportsPage } from '@/app/components/sports';

export default function NFLPage() {
  return (
    <SimpleSportsPage
      title="NFL"
      description="National Football League - Live scores, stats, and more"
    >
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p>Welcome to the National Football League</p>
      </div>
    </SimpleSportsPage>
  );
}
