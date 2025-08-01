import type {RecommendedDashboard} from '../../../../../types/general/recommendedDashboardType.ts';

const dashboard: RecommendedDashboard = {
  name: 'Ownership',
  items: [
    {
      id: 0,
      width: 40,
      height: 8,
      pluginName: 'Changes',
      dataPluginId: undefined,
      x: 0,
      y: 0,
    },
    {
      id: 0,
      width: 20,
      height: 8,
      pluginName: 'Builds',
      dataPluginId: undefined,
      x: 0,
      y: 8,
    },
  ],
};

export default dashboard;
