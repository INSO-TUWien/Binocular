import PreviewImage from '../assets/thumbnail.svg';
import Settings, { type TimeSpentSettings } from './settings/settings.tsx';
import type { VisualizationPlugin } from '../../../interfaces/visualizationPlugin.ts';
import { getSVGData } from './utilities/utilities.ts';
import Reducer from './reducer';
import { convertToChartData } from './utilities/dataConverter.ts';
import Saga from './saga';
import Help from './help/help.tsx';
import type { DataPluginNote } from '../../../interfaces/dataPluginInterfaces/dataPluginNotes.ts';
import { VisualizationPluginMetadataCategory } from '../../../interfaces/visualizationPluginInterfaces/visualizationPluginMetadata.ts';

const TimeSpent: VisualizationPlugin<TimeSpentSettings, DataPluginNote> = {
  name: 'Time Spent',
  chartComponent: undefined,
  settingsComponent: Settings,
  helpComponent: Help,
  dataConnectionName: 'notes',
  dataConverter: convertToChartData,
  defaultSettings: { splitTimePerIssue: false, splitAdditionsDeletions: true, visualizationStyle: 'curved', showSprints: false },
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
    category: VisualizationPluginMetadataCategory.AuthorBehaviour,
    recommended: false,
    description: '(Gitlab only) A line chart that visualizes the amount of hours spent/removed over time.',
  },
  reducer: Reducer,
  saga: Saga,
};

export default TimeSpent;
