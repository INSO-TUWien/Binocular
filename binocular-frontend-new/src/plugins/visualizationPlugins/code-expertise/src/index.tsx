import PreviewImage from '../assets/thumbnail.svg';
import Settings, { SettingsType } from './settings/settings';
import { VisualizationPlugin } from '../../../interfaces/visualizationPlugin';
import { getSVGData } from './utilities/utilities';
import { dataSlice } from './reducer';
import Saga from './saga/index';
import Help from './help/help';
import Chart from './chart/chart';
import { convertToChartData } from './utilities/dataConverter';
import { DataPluginCommitBuild } from '../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts.ts';
import { VisualizationPluginMetadataCategory } from '../../../interfaces/visualizationPluginInterfaces/visualizationPluginMetadata.ts';

const CodeExpertise: VisualizationPlugin<SettingsType, DataPluginCommitBuild> = {
  name: 'Code Expertise',
  chartComponent: Chart,
  settingsComponent: Settings,
  helpComponent: Help,
  defaultSettings: {},
  dataConverter: convertToChartData,
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

export default CodeExpertise;
