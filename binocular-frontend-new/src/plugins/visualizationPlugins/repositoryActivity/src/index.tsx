import Chart from './chart/chart.tsx';
import Settings, { type RepositoryActivitySettings } from './settings/settings.tsx';
import Help from './help/help';
import Saga from './saga';
import Reducer from './reducer';
import type { VisualizationPlugin } from '../../../interfaces/visualizationPlugin.ts';
import PreviewImage from '../assets/thumbnail.svg';
import { VisualizationPluginMetadataCategory } from '../../../interfaces/visualizationPluginInterfaces/visualizationPluginMetadata.ts';

const RepositoryActivity: VisualizationPlugin<RepositoryActivitySettings, null> = {
  name: 'Repository Activity',
  chartComponent: Chart,
  settingsComponent: Settings,
  helpComponent: Help,
  defaultSettings: {},
  export: {
    getSVGData: () => '<svg></svg>',
  },
  capabilities: {
    popoutOnly: false,
    export: false,
  },
  images: {
    thumbnail: PreviewImage,
  },
  metadata: {
    category: VisualizationPluginMetadataCategory.Ownership,
    recommended: false,
    description: 'Shows how many lines are owned by which author over time.',
    compatibility: { binocularBackend: true, githubAPI: false, mockData: true, pouchDB: true, github: true, gitlab: true },
  },
  reducer: Reducer,
  saga: Saga,
};
export default RepositoryActivity;
