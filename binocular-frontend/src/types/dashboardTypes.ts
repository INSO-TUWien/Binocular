export interface DashboardState {
  visualizations: DashboardVisualization[];
}

export interface DashboardVisualization {
  key: string;
  id: number;
  size: DashboardVisualizationSize;
  universalSettings: boolean;
}

export enum DashboardVisualizationSize {
  small,
  large,
  wide,
  high,
}
