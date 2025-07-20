'use client';

import { SportsPageLayout } from '@/app/components/sports';
import { ALL_SPORTS_BUTTONS } from '@/app/components/sports/sports-config';

export default function AllSportsPage() {
  return (
    <SportsPageLayout
      title="All Sports"
      description="Explore all sports leagues - NBA, NFL, MLB, NHL, MLS and more"
      showLiveGamesButton
      showSportButtons
      sportButtons={ALL_SPORTS_BUTTONS}
    >
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p>Welcome to All Sports - Explore your favorite leagues</p>
      </div>
    </SportsPageLayout>
  );
}
