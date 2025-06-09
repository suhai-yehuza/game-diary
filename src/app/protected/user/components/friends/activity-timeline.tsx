import * as React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  type: string;
  timestamp: string;
  gameTitle?: string;
  score?: string | number;
  details?: Record<string, string | number>;
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
  isLoading?: boolean;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  isLoading = false,
}) => {
  const [visibleItems, setVisibleItems] = useState(10);

  const loadMore = () => {
    setVisibleItems(prev => prev + 10);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 animate-fade-in">
        <p>No activities yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Activity items */}
        <div className="space-y-6 stagger-children">
          {activities.slice(0, visibleItems).map((activity, index) => (
            <div
              key={activity.id}
              className="relative flex items-start gap-4 animate-slide-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Timeline dot */}
              <div className="relative z-10 w-10 h-10 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
              </div>

              {/* Activity content */}
              <div className="flex-1 bg-white rounded-lg border p-4 hover-lift">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{activity.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>

                    {/* Activity metadata */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                        {activity.type}
                      </span>
                      <span>
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                      {activity.gameTitle && (
                        <span className="text-blue-600 font-medium">{activity.gameTitle}</span>
                      )}
                    </div>

                    {/* Activity details */}
                    {activity.details && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(activity.details).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-500 capitalize">{key}:</span>
                              <span className="font-medium">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Activity score/rating */}
                  {activity.score && (
                    <div className="ml-4 text-right">
                      <div className="text-lg font-bold text-blue-600">{activity.score}</div>
                      <div className="text-xs text-gray-500">Score</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Load more button */}
      {visibleItems < activities.length && (
        <div className="text-center">
          <button
            onClick={loadMore}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors tap-scale"
          >
            Load More ({activities.length - visibleItems} remaining)
          </button>
        </div>
      )}
    </div>
  );
};
