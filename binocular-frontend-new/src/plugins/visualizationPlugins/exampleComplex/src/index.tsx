import Chart from './chart/chart.tsx';
import PreviewImage from '../assets/thumbnail.svg';
import Settings, { SettingsType } from './settings/settings.tsx';
import { VisualizationPlugin } from '../../../interfaces/visualizationPlugin.ts';
import { store } from './redux';

const ExampleComplex: VisualizationPlugin<SettingsType> = {
  name: 'Example Complex',
  chartComponent: Chart,
  settingsComponent: Settings,
  defaultSettings: {},
  export: {
    getSVGData: () => '<svg></svg>',
  },
  capabilities: {
    popoutOnly: true,
    export: false,
  },
  images: {
    thumbnail: PreviewImage,
  },
  store: store,
};
export default ExampleComplex;
