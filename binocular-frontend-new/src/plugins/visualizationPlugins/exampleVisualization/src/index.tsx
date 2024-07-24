import Chart from './chart/chart.tsx';
import PreviewImage from '../assets/thumbnail.svg';
import Settings, { SettingsType } from './settings/settings.tsx';
import { VisualizationPlugin } from '../../../interfaces/visualizationPlugin.ts';
import Reducer from './reducer';
import Saga from './saga';

const ExampleVisualization: VisualizationPlugin<SettingsType> = {
  name: 'Example Visualization',
  chartComponent: Chart,
  settingsComponent: Settings,
  defaultSettings: { data: [], color: '#007AFF' },
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
export default ExampleVisualization;
