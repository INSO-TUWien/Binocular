import Chart, { getSVGData } from './chart/chart.tsx';
import PreviewImage from '../assets/thumbnail.svg';
import Settings, { SettingsType } from './settings/settings.tsx';
import { VisualizationPlugin } from '../../../interfaces/visualizationPlugin.ts';

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
};

export default Changes;
