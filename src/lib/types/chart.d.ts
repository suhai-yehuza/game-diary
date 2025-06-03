declare module 'chart.js' {
  export interface ChartOptions {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    [key: string]: unknown;
  }

  export interface ChartData {
    labels?: string[];
    datasets: Array<{
      label?: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
      [key: string]: unknown;
    }>;
  }

  export interface ChartProps {
    type: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'polarArea';
    data: ChartData;
    options?: ChartOptions;
  }

  export class Chart {
    constructor(ctx: CanvasRenderingContext2D, config: ChartProps);
    destroy(): void;
    update(mode?: 'resize' | 'reset' | 'none' | 'hide' | 'show' | 'normal' | 'active'): void;
  }

  export const Chart: {
    new (ctx: CanvasRenderingContext2D, config: ChartProps): Chart;
  };

  export default Chart;
}
