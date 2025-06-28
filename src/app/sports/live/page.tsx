import { LiveGamesDetail } from '@src/app/components/live-games-detail';
import { getRapidApiConfig } from '@src/lib/config/api.config';

export function LiveGamesPage() {
  const rapidApiConfig = getRapidApiConfig();
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Live Games</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Watch live NBA games with real-time scores and updates
        </p>
      </div>

      <LiveGamesDetail rapidApiConfig={rapidApiConfig} />
    </div>
  );
}

export default LiveGamesPage;
