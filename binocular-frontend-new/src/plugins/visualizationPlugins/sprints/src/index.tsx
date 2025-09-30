import PreviewImage from '../assets/thumbnail.svg';
import Settings, { type SprintSettings } from './settings/settings.tsx';
import type { VisualizationPlugin } from '../../../interfaces/visualizationPlugin.ts';
import Reducer from './reducer';
import Saga from './saga';
import Help from './help/help.tsx';
import type { DataPluginIssue } from '../../../interfaces/dataPluginInterfaces/dataPluginIssues.ts';
import { VisualizationPluginMetadataCategory } from '../../../interfaces/visualizationPluginInterfaces/visualizationPluginMetadata.ts';
import Chart from './chart/Chart.tsx';

const Sprints: VisualizationPlugin<SprintSettings, DataPluginIssue> = {
  name: 'Sprints',
  chartComponent: Chart,
  settingsComponent: Settings,
  dataConnectionName: 'issues',
  helpComponent: Help,
  defaultSettings: {
    showSprints: false,
    coloringMode: 'author',
  },
  export: {
    getSVGData: () => '',
  },
  capabilities: {
    popoutOnly: false,
    export: false,
  },
  images: {
    thumbnail: PreviewImage,
  },
  metadata: {
    category: VisualizationPluginMetadataCategory.Issues,
    recommended: false,
    description:
      'A bar chart that visualizes issues in relation to the defined sprints.',
  },
  reducer: Reducer,
  saga: Saga,
};

export default Sprints;
