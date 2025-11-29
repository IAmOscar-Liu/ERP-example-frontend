export type CustomChartData = {
  data: {
    dataKey: string;
    color?: string;
    data: number[];
  }[];
  xAxis: (string | number)[];
  yAxis?: (string | number)[];
  min?: number;
  max?: number;
};
