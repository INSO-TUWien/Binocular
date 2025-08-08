import PreviewImage from '../assets/thumbnail.svg';
import Settings, { type SettingsType } from './settings/settings.tsx';
import type { VisualizationPlugin } from '../../../interfaces/visualizationPlugin.ts';
import { getSVGData } from './utilities/utilities.ts';
import Reducer from '../../simpleVisualizationPlugin/src/reducer';
import Saga from './saga';
import Help from './help/help.tsx';
import { convertToChartData } from './utilities/dataConverter.ts';
import type { DataPluginCommit } from '../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';
import { VisualizationPluginMetadataCategory } from '../../../interfaces/visualizationPluginInterfaces/visualizationPluginMetadata.ts';

const SumCommits: VisualizationPlugin<SettingsType, DataPluginCommit> = {
  name: 'SumCommits',
  // ts-expect-error
  chartComponent: null,
  settingsComponent: Settings,
  helpComponent: Help,
  dataConverter: convertToChartData,
  dataConnectionName: 'commits',
  defaultSettings: { showMean: false, showOther: false },
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
    recommended: true,
    description: 'A line chart that visualizes the amount of additions and deletion and what author is responsible for them over time.',
  },
  reducer: Reducer,
  saga: Saga,
};

export default SumCommits;
