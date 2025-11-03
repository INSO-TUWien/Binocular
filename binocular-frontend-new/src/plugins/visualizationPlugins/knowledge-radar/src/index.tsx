import PreviewImage from '../assets/thumbnail.svg';
import Settings, { type SettingsType } from './settings/settings';
import type { VisualizationPlugin } from '../../../interfaces/visualizationPlugin';
import { getSVGData } from './utilities/utilities';
import { dataSlice } from './reducer';
import Saga from './saga/index';
import Help from './help/help';
import Chart from './chart/chart';
import type { DataPluginCommit } from '../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';
import { VisualizationPluginMetadataCategory } from '../../../interfaces/visualizationPluginInterfaces/visualizationPluginMetadata.ts';

const KnowledgeRadar: VisualizationPlugin<SettingsType, DataPluginCommit> = {
  name: 'Knowledge Radar',
  chartComponent: Chart,
  settingsComponent: Settings,
  helpComponent: Help,
  defaultSettings: {},
  export: {
    getSVGData: getSVGData,
  },
  capabilities: {
    popoutOnly: false,
    export: false,
  },
  images: {
    thumbnail: PreviewImage,
  },
  metadata: {
    category: VisualizationPluginMetadataCategory.Expertise,
    recommended: false,
    defaultSize: [12, 14],
    description: 'Visualize knowledge and expertise across the project, compare between different developers.',
  },
  reducer: dataSlice.reducer,
  saga: Saga,
};

export default KnowledgeRadar;
