'use client';

import React from 'react';

import { type StatsChartProps } from '@src/lib/types/consolidated.types';

// Temporary placeholder component to avoid chart.js SSR issues during build
export const StatsChart: React.FC<StatsChartProps> = ({ title, height = 400, type }) => {
  return (
    <div style={{ height: `${height}px` }} className="w-full bg-white p-4 rounded-lg shadow">
      <div className="flex items-center justify-center h-full text-center">
        <div>
          <div className="text-lg font-semibold text-gray-700 mb-2">
            {title || `${type.charAt(0).toUpperCase() + type.slice(1)} Chart`}
          </div>
          <div className="text-gray-500">Chart functionality temporarily disabled</div>
          <div className="text-sm text-gray-400 mt-1">
            Chart.js will be re-enabled after SSR issues are resolved
          </div>
        </div>
      </div>
    </div>
  );
};
