import Chart from './chart/chart.tsx';
import PreviewImage from '../assets/preview.svg';
import Settings from './settings/settings.tsx';

export default {
  name: 'Example Visualization',
  chartComponent: Chart,
  settingsComponent: Settings,
  defaultSettings: { data: [], color: '#007AFF' },
  capabilities: {
    popoutOnly: false,
  },
  images: {
    preview: PreviewImage,
  },
};
