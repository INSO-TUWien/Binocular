import PreviewImage from '../assets/thumbnail.svg';
import Settings, { SettingsType } from './settings/settings';
import { VisualizationPlugin } from '../../../interfaces/visualizationPlugin';
import { getSVGData } from './utilities/utilities';
import { dataSlice } from './reducer';
import Saga from './saga/index';
import Help from './help/help';
import Chart from './chart/chart';
import { DataPluginCommitBuild } from '../../../interfaces/dataPluginInterfaces/dataPluginCommitsBuilds';

const KnowledgeRadar: VisualizationPlugin<SettingsType, DataPluginCommitBuild> = {
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
  reducer: dataSlice.reducer,
  saga: Saga,
};

export default KnowledgeRadar;
