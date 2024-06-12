import Chart from './chart/chart.tsx';
import PreviewImage from '../assets/thumbnail.svg';
import Settings, { SettingsType } from './settings/settings.tsx';
import { VisualizationPlugin } from '../../../interfaces/visualizationPlugin.ts';

const ExampleStats: VisualizationPlugin<SettingsType> = {
  name: 'Example Stats',
  chartComponent: Chart,
  settingsComponent: Settings,
  defaultSettings: {},
  capabilities: {
    popoutOnly: false,
  },
  images: {
    thumbnail: PreviewImage,
  },
};
export default ExampleStats;
