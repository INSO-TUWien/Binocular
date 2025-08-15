import PreviewImage from '../assets/thumbnail.svg';
import Settings, { type IssueSettings } from './settings/settings.tsx';
import type { VisualizationPlugin } from '../../../interfaces/visualizationPlugin.ts';
import { getSVGData } from './utilities/utilities.ts';
import Reducer from './reducer';
import { convertToChartData } from './utilities/dataConverter.ts';
import Saga from './saga';
import Help from './help/help.tsx';
import type { DataPluginIssue } from '../../../interfaces/dataPluginInterfaces/dataPluginIssues.ts';
import { VisualizationPluginMetadataCategory } from '../../../interfaces/visualizationPluginInterfaces/visualizationPluginMetadata.ts';

const Issues: VisualizationPlugin<IssueSettings, DataPluginIssue> = {
  name: 'Issues',
  chartComponent: undefined,
  settingsComponent: Settings,
  dataConnectionName: 'issues',
  dataConverter: convertToChartData,
  helpComponent: Help,
  defaultSettings: { splitIssuesPerAuthor: false, visualizationStyle: 'curved', showSprints: false },
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
    recommended: true,
    description: 'A line chart that visualizes the amount of issues open and closed.',
  },
  reducer: Reducer,
  saga: Saga,
};

export default Issues;
