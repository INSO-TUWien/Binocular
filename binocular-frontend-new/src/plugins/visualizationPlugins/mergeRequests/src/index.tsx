import PreviewImage from '../assets/thumbnail.svg';
import Settings, { type MergeRequestsSettings } from './settings/settings.tsx';
import type { VisualizationPlugin } from '../../../interfaces/visualizationPlugin.ts';
import { getSVGData } from './utilities/utilities.ts';
import Reducer from './reducer';
import { convertToChartData } from './utilities/dataConverter.ts';
import Saga from './saga';
import Help from './help/help.tsx';
import { VisualizationPluginMetadataCategory } from '../../../interfaces/visualizationPluginInterfaces/visualizationPluginMetadata.ts';
import type { DataPluginMergeRequest } from '../../../interfaces/dataPluginInterfaces/dataPluginMergeRequests.ts';

const MergeRequests: VisualizationPlugin<MergeRequestsSettings, DataPluginMergeRequest> = {
  name: 'Merge Requests',
  chartComponent: undefined,
  settingsComponent: Settings,
  dataConnectionName: 'mergeRequests',
  dataConverter: convertToChartData,
  helpComponent: Help,
  defaultSettings: { splitMergeRequestsPerAuthor: false, visualizationStyle: 'curved', showSprints: false },
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
    description: 'A line chart that visualizes the amount of merge requests open and closed.',
  },
  reducer: Reducer,
  saga: Saga,
};

export default MergeRequests;
