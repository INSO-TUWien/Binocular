import Chart from './chart/chart.tsx';
import PreviewImage from '../assets/preview.svg';
import Settings from './settings/settings.tsx';

export default {
  name: 'Example Complex',
  chartComponent: Chart,
  settingsComponent: Settings,
  defaultSettings: {},
  capabilities: {
    popoutOnly: true,
  },
  images: {
    preview: PreviewImage,
  },
};
