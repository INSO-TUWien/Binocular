import Chart from './chart/chart.tsx';
import PreviewImage from '../assets/preview.svg';
import Settings from './settings/settings.tsx';

export default {
  name: 'Example Stats',
  chartComponent: Chart,
  settingsComponent: Settings,
  defaultSettings: {},
  images: {
    preview: PreviewImage,
  },
};
