// Custom Chart.js type definitions to avoid SSR issues
export interface IChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  [key: string]: unknown;
}

export interface IChartDataset {
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

export interface IChartData<TLabel = string> {
  labels?: TLabel[];
  datasets: IChartDataset[];
}

export interface IChartProps {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'polarArea';
  data: IChartData;
  options?: IChartOptions;
}

// Module declaration for chart.js to avoid importing the actual library
declare module 'chart.js' {
  export type * from '@src/lib/types/chart';
}
