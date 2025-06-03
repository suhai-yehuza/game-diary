import 'chart.js/auto';
import React from 'react';
import { Line, Bar, Radar } from 'react-chartjs-2';

import { type StatsChartProps } from '@/lib/types/consolidated.types';

export const StatsChart: React.FC<StatsChartProps> = ({
  data,
  type,
  title,
  height = 400,
  stacked = false,
}) => {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  const renderChart = () => {
    switch (type) {
      case 'line': {
        const options = {
          ...baseOptions,
          scales: {
            y: {
              beginAtZero: true,
              stacked,
            },
            x: {
              stacked,
            },
          },
        };
        return <Line data={data} options={options} />;
      }
      case 'bar': {
        const options = {
          ...baseOptions,
          scales: {
            y: {
              beginAtZero: true,
              stacked,
            },
            x: {
              stacked,
            },
          },
        };
        return <Bar data={data} options={options} />;
      }
      case 'radar': {
        const options = {
          ...baseOptions,
          scales: {
            r: {
              beginAtZero: true,
            },
          },
        };
        return <Radar data={data} options={options} />;
      }
      default:
        return null;
    }
  };

  return (
    <div style={{ height: `${height}px` }} className="w-full bg-white p-4 rounded-lg shadow">
      {renderChart()}
    </div>
  );
};
