export interface DashboardState {
  visualizations: DashboardVisualization[];
}

export interface DashboardVisualization {
  key: string;
  id: number;
  size: string;
  universalSettings: true;
}
