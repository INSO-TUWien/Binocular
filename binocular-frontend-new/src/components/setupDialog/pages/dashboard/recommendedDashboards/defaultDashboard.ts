import { RecommendedDashboard } from '../../../../../types/general/recommendedDashboardType.ts';

const dashboard: RecommendedDashboard = {
  name: 'Default',
  items: [
    {
      id: 0,
      width: 20,
      height: 12,
      pluginName: 'Changes',
      dataPluginId: undefined,
      x: 0,
      y: 0,
    },
    {
      id: 0,
      width: 20,
      height: 12,
      pluginName: 'Builds',
      dataPluginId: undefined,
      x: 20,
      y: 0,
    },
  ],
};

export default dashboard;
