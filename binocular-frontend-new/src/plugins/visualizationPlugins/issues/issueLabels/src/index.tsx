import PreviewImage from '../assets/thumbnail.svg';
import Settings, { type IssueLabelsSettings } from './settings/settings.tsx';
import type { VisualizationPlugin } from '../../../../interfaces/visualizationPlugin.ts';
import { getSVGData } from './utilities/utilities.ts';
import Reducer from './reducer';
import Saga from './saga';
import Help from './help/help.tsx';
import Chart from './chart/Chart.tsx';
import type { DataPluginIssue } from '../../../../interfaces/dataPluginInterfaces/dataPluginIssues.ts';
import { VisualizationPluginMetadataCategory } from '../../../../interfaces/visualizationPluginInterfaces/visualizationPluginMetadata.ts';

const IssueLabels: VisualizationPlugin<IssueLabelsSettings, DataPluginIssue> = {
  name: 'Issue Labels',
  chartComponent: Chart,
  settingsComponent: Settings,
  dataConnectionName: 'issues',
  helpComponent: Help,
  defaultSettings: {
    selectedLabels: [],
    visualizationStyle: 'curved',
    showSprints: false,
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
    category: VisualizationPluginMetadataCategory.Issues,
    recommended: false,
    description:
      'A stacked area chart that visualizes additions and deletions over time for commits linked to issues carrying the selected label(s), either directly or through a merge request.',
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

export default IssueLabels;
