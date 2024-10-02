import Chart from './chart/chart.tsx';
import PreviewImage from '../assets/thumbnail.svg';
import Settings, { SettingsType } from './settings/settings.tsx';
import { VisualizationPlugin } from '../../../interfaces/visualizationPlugin.ts';
import Reducer from './reducer';
import Saga from './saga';
import Help from './help/help.tsx';

const ExampleComplex: VisualizationPlugin<SettingsType> = {
  name: 'Example Complex',
  chartComponent: Chart,
  settingsComponent: Settings,
  helpComponent: Help,
  defaultSettings: {},
  export: {
    getSVGData: () => '<svg></svg>',
  },
  capabilities: {
    popoutOnly: true,
    export: false,
  },
  images: {
    thumbnail: PreviewImage,
  },
  reducer: Reducer,
  saga: Saga,
};
export default ExampleComplex;
