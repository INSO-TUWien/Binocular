import { DashboardLayoutCategory, type DashboardLayout } from '../../../types/general/dashboardLayoutType';

const dashboard: DashboardLayout = {
  category: DashboardLayoutCategory.BASIC,
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
      settings: undefined,
    },
    {
      id: 0,
      width: 20,
      height: 8,
      pluginName: 'Builds',
      dataPluginId: undefined,
      x: 0,
      y: 8,
      settings: undefined,
    },
    {
      id: 0,
      width: 20,
      height: 8,
      pluginName: 'Code Ownership',
      dataPluginId: undefined,
      x: 20,
      y: 8,
      settings: undefined,
    },
    {
      id: 0,
      width: 20,
      height: 8,
      pluginName: 'Code Ownership',
      dataPluginId: undefined,
      x: 20,
      y: 8,
    },
  ],
};

export default dashboard;
