import PreviewImage from '../assets/thumbnail.svg';
import Settings, { SettingsType } from './settings/settings.tsx';
import { VisualizationPlugin } from '../../../interfaces/visualizationPlugin.ts';
import Reducer from './reducer';
import Saga from './saga';
import Help from './help/help.tsx';
import { DataPluginCommitFile } from '../../../interfaces/dataPluginInterfaces/dataPluginCommitsFiles.ts';
import Chart from './chart/chart.tsx';

const CommitByFile: VisualizationPlugin<SettingsType, DataPluginCommitFile> = {
  name: 'Commit By File',
  chartComponent: Chart,
  settingsComponent: Settings,
  dataConnectionName: 'commitByFile',
  helpComponent: Help,
  defaultSettings: { sha: '' },
  export: {
    getSVGData: () => '<svg></svg>',
  },
  capabilities: {
    popoutOnly: false,
    export: false,
  },
  images: {
    thumbnail: PreviewImage,
  },
  reducer: Reducer,
  saga: Saga,
};
export default CommitByFile;
