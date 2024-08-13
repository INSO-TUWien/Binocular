export interface DashboardItemDTO {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DashboardItemType extends DashboardItemDTO {
  pluginName?: string;
  dataPluginId: number | undefined;
}
