import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import React from 'react';
import { Line, Bar, Radar } from 'react-chartjs-2';

import { type StatsChartProps } from '@/lib/types/consolidated.types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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
        const options: ChartOptions<'line'> = {
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
        return <Line data={data as ChartData<'line'>} options={options} />;
      }
      case 'bar': {
        const options: ChartOptions<'bar'> = {
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
        return <Bar data={data as ChartData<'bar'>} options={options} />;
      }
      case 'radar': {
        const options: ChartOptions<'radar'> = {
          ...baseOptions,
          scales: {
            r: {
              beginAtZero: true,
            },
          },
        };
        return <Radar data={data as ChartData<'radar'>} options={options} />;
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
