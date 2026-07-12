import PreviewImage from '../assets/lizard-bar-chart.svg';
import Settings, { type LizardSettings } from './settings/settings.tsx';
import type { VisualizationPlugin } from '../../../../interfaces/visualizationPlugin.ts';
import { getSVGData } from './utilities/utilities.ts';
import Reducer from './reducer';
import Saga from './saga';
import Help from './help/help.tsx';
import type { DataPluginLizard } from '../../../../interfaces/dataPluginInterfaces/dataPluginLizards.ts';
import { VisualizationPluginMetadataCategory } from '../../../../interfaces/visualizationPluginInterfaces/visualizationPluginMetadata';
import Chart from './chart/chart.tsx';

const LizardStats: VisualizationPlugin<LizardSettings, DataPluginLizard> = {
  name: 'Lizard Stats',
  chartComponent: Chart,
  settingsComponent: Settings,
  helpComponent: Help,
  dataConnectionName: 'lizards',
  defaultSettings: {
    topN: 5,
    maxWeight: 0.5,
  },
  export: {
    getSVGData,
  },
  capabilities: {
    popoutOnly: false,
    export: true,
  },
  images: {
    thumbnail: PreviewImage,
  },
  metadata: {
    category: VisualizationPluginMetadataCategory.Statistics,
    recommended: false,
    description: 'A bar chart showing the least maintainable files based on Lizard metrics.',
    compatibility: { binocularBackend: true, githubAPI: false, mockData: false, pouchDB: false, github: false, gitlab: false },
  },
  reducer: Reducer,
  saga: Saga,
};

export default LizardStats;
