import Chart from './chart/chart.tsx';
import PreviewImage from '../assets/thumbnail.svg';
import Settings, { SettingsType } from './settings/settings.tsx';
import { VisualizationPlugin } from '../../../interfaces/visualizationPlugin.ts';

const ExampleVisualization: VisualizationPlugin<SettingsType> = {
  name: 'Example Visualization',
  chartComponent: Chart,
  settingsComponent: Settings,
  defaultSettings: { data: [], color: '#007AFF' },
  capabilities: {
    popoutOnly: false,
  },
  images: {
    thumbnail: PreviewImage,
  },
};
export default ExampleVisualization;
