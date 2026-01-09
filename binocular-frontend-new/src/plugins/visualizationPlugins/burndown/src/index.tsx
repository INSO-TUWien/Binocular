import PreviewImage from '../assets/thumbnail.svg';
import Settings, { type BurndownSettings } from './settings/settings.tsx';
import type { VisualizationPlugin } from '../../../interfaces/visualizationPlugin.ts';
import Reducer from './reducer';
import Saga from './saga';
import Help from './help/help.tsx';
import type { DataPluginIssue } from '../../../interfaces/dataPluginInterfaces/dataPluginIssues.ts';
import { VisualizationPluginMetadataCategory } from '../../../interfaces/visualizationPluginInterfaces/visualizationPluginMetadata.ts';
import Chart from './chart/Chart.tsx';

const Burndown: VisualizationPlugin<BurndownSettings, DataPluginIssue> = {
  name: 'Burndown',
  chartComponent: Chart,
  settingsComponent: Settings,
  dataConnectionName: 'issues',
  helpComponent: Help,
  defaultSettings: {
    showSprints: false,
  },
  export: {
    getSVGData: () => '',
  },
  capabilities: {
    popoutOnly: import.meta.env.PROD,
    export: false,
  },
  images: {
    thumbnail: PreviewImage,
  },
  metadata: {
    category: VisualizationPluginMetadataCategory.Issues,
    recommended: false,
    description: 'A chart that visualizes the number of open issues in relation to the selected date range.',
    compatibility: {
      binocularBackend: true,
      github: true,
      githubAPI: false,
      gitlab: true,
      mockData: true,
      pouchDB: true,
    },
  },
  reducer: Reducer,
  saga: Saga,
};

export default Burndown;
