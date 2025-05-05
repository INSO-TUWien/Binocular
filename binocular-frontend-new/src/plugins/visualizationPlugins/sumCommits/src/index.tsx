import PreviewImage from '../assets/thumbnail.svg';
import Settings, { SettingsType } from './settings/settings.tsx';
import { VisualizationPlugin } from '../../../interfaces/visualizationPlugin.ts';
import { getSVGData } from './utilities/utilities.ts';
import Reducer from '../../simpleVisualizationPlugin/src/reducer';
import Saga from './saga';
import Help from './help/help.tsx';
import { convertToChartData } from './utilities/dataConverter.ts';
import { DataPluginCommit } from '../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';

const SumCommits: VisualizationPlugin<SettingsType, DataPluginCommit> = {
  name: 'Sum Commits',
  // ts-expect-error
  chartComponent: null,
  settingsComponent: Settings,
  helpComponent: Help,
  dataConverter: convertToChartData,
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
  reducer: Reducer,
  saga: Saga,
};

export default SumCommits;
