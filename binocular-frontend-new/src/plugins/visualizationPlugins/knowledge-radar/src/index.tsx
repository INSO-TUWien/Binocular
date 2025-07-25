import PreviewImage from '../assets/thumbnail.svg';
import Settings, { SettingsType } from './settings/settings';
import { VisualizationPlugin } from '../../../interfaces/visualizationPlugin';
import { getSVGData } from './utilities/utilities';
import { dataSlice } from './reducer';
import Saga from './saga/index';
import Help from './help/help';
import Chart from './chart/chart';
import { DataPluginCommit } from '../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';
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
    export: true,
  },
  images: {
    thumbnail: PreviewImage,
  },
  metadata: {
    category: VisualizationPluginMetadataCategory.Expertise,
  },
  reducer: dataSlice.reducer,
  saga: Saga,
};

export default KnowledgeRadar;
