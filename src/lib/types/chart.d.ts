export interface IChartData<TLabel = string> {
  labels?: TLabel[];
  datasets: IChartDataset[];
}
