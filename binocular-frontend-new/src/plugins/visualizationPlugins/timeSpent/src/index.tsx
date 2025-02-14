import PreviewImage from '../assets/thumbnail.svg';
import Settings, { SettingsType } from './settings/settings.tsx';
import { VisualizationPlugin } from '../../../interfaces/visualizationPlugin.ts';
import { getSVGData } from './utilities/utilities.ts';
import Reducer from '../../simpleVisualizationPlugin/src/reducer';
import Saga from './saga';
import Help from './help/help.tsx';
import { convertToChartData } from './utilities/dataConverter.ts';
import { DataPluginTimeSpent } from '../../../interfaces/dataPluginInterfaces/dataPluginTimeSpent.ts';

const TimeSpent: VisualizationPlugin<SettingsType, DataPluginTimeSpent> = {
  name: 'TimeSpent',
  chartComponent: null,
  settingsComponent: Settings,
  helpComponent: Help,
  dataConverter: convertToChartData,
  defaultSettings: { splitAdditionsDeletions: true, visualizationStyle: 'curved' },
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

export default TimeSpent;
