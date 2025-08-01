import Chart from './chart/chart.tsx';
import PreviewImage from '../assets/thumbnail.svg';
import Settings, { SettingsType } from './settings/settings.tsx';
import { VisualizationPlugin } from '../../../interfaces/visualizationPlugin.ts';
import Reducer from './reducer';
import Saga from './saga';
import Help from './help/help.tsx';
import { VisualizationPluginMetadataCategory } from '../../../interfaces/visualizationPluginInterfaces/visualizationPluginMetadata.ts';

const RepositoryStats: VisualizationPlugin<SettingsType, unknown> = {
  name: 'Repository Stats',
  chartComponent: Chart,
  settingsComponent: Settings,
  helpComponent: Help,
  defaultSettings: { commits: true, contributors: true, issues: true },
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
  reducer: Reducer,
  saga: Saga,
  metadata: {
    category: VisualizationPluginMetadataCategory.Statistics,
    recommended: false,
    description: 'Statistics about the repository.',
  },
};
export default RepositoryStats;
