import PreviewImage from '../assets/thumbnail.svg';
import Settings, { SettingsType } from './settings/settings';
import { VisualizationPlugin } from '../../../interfaces/visualizationPlugin';
import { getSVGData } from './utilities/utilities';
import Reducer from './reducer';
import Saga from './saga/index';
import Help from './help/help';
import Chart from './chart/chart';

const CodeExpertise: VisualizationPlugin<SettingsType> = {
  name: 'Code Expertise',
  // ts-expect-error
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
  reducer: Reducer,
  saga: Saga,
};

export default CodeExpertise;