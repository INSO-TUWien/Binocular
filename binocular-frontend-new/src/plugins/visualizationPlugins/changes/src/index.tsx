import Chart from './chart/chart.tsx';
import PreviewImage from '../assets/thumbnail.svg';
import Settings, { SettingsType } from './settings/settings.tsx';
import { VisualizationPlugin } from '../../../interfaces/visualizationPlugin.ts';
import { store } from './redux';
import { getSVGData } from './utilities/utilities.ts';
const Changes: VisualizationPlugin<SettingsType> = {
  name: 'Changes',
  chartComponent: Chart,
  settingsComponent: Settings,
  defaultSettings: { splitAdditionsDeletions: false, visualizationStyle: 'curved' },
  export: {
    getSVGData: getSVGData,
  },
  capabilities: {
    popoutOnly: false,
    export: true,
  },
  images: {
    thumbnail: PreviewImage,
  },
  store: store,
};

export default Changes;
