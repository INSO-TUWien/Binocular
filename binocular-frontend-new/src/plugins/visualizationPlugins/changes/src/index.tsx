import Chart from './chart/chart.tsx';
import PreviewImage from '../assets/thumbnail.svg';
import Settings, { SettingsType } from './settings/settings.tsx';
import { VisualizationPlugin } from '../../../interfaces/visualizationPlugin.ts';

const Changes: VisualizationPlugin<SettingsType> = {
  name: 'Changes',
  chartComponent: Chart,
  settingsComponent: Settings,
  defaultSettings: { color: '#007AFF' },
  capabilities: {
    popoutOnly: false,
  },
  images: {
    thumbnail: PreviewImage,
  },
};

export default Changes;
