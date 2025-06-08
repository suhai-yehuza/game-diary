// Custom Chart.js type definitions to avoid SSR issues
export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  [key: string]: unknown;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
  pointBackgroundColor?: string | string[];
  pointBorderColor?: string | string[];
  pointHoverBackgroundColor?: string | string[];
  pointHoverBorderColor?: string | string[];
  [key: string]: unknown;
}

export interface ChartData<TLabel = string> {
  labels?: TLabel[];
  datasets: ChartDataset[];
}

export interface ChartProps {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'polarArea';
  data: ChartData;
  options?: ChartOptions;
}

// Module declaration for chart.js to avoid importing the actual library
declare module 'chart.js' {
  export type * from '@src/lib/types/chart';
}
