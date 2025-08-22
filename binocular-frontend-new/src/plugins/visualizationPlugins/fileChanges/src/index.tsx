import Chart from './chart/chart.tsx';
import PreviewImage from '../assets/thumbnail.svg';
import Settings, { type SettingsType } from './settings/settings.tsx';
import type { VisualizationPlugin } from '../../../interfaces/visualizationPlugin.ts';
import { getSVGData } from './utilities/utilities.ts';
import Reducer from './reducer';
import Saga from './saga';
import Help from './help/help.tsx';
import { VisualizationPluginMetadataCategory } from '../../../interfaces/visualizationPluginInterfaces/visualizationPluginMetadata.ts';

const FileChanges: VisualizationPlugin<SettingsType, null> = {
  name: 'File Changes',
  chartComponent: Chart,
  settingsComponent: Settings,
  helpComponent: Help,
  defaultSettings: {
    file: 'README.md',
    splitAdditionsDeletions: true,
    visualizationStyle: 'curved',
    showExtraMetrics: false,
  },
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
  metadata: {
    category: VisualizationPluginMetadataCategory.Commits,
    recommended: false,
    description:
      'A line chart that visualizes the amount of additions and deletion and what author is responsible for them over time for an individual file.',
  },
  reducer: Reducer,
  saga: Saga,
};

export default FileChanges;
