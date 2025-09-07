import PreviewImage from '../assets/thumbnail.svg';
import type { VisualizationPlugin } from '../../../interfaces/visualizationPlugin.ts';
import { VisualizationPluginMetadataCategory } from '../../../interfaces/visualizationPluginInterfaces/visualizationPluginMetadata.ts';
import Reducer from './reducer';
import Saga from './saga';

const Issues: VisualizationPlugin<unknown, unknown> = {
  name: 'Sprints',
  chartComponent: undefined,
  settingsComponent: () => null,
  dataConnectionName: 'sprints',
  dataConverter: undefined,
  helpComponent: () => null,
  defaultSettings: {},
  export: {
    getSVGData: () => '',
  },
  capabilities: {
    popoutOnly: true,
    export: true,
  },
  images: { thumbnail: PreviewImage },
  metadata: {
    category: VisualizationPluginMetadataCategory.Issues,
    recommended: false,
    description:
      'A line chart that visualizes the amount of issues open and closed.',
  },
  reducer: Reducer,
  saga: Saga,
};

export default Issues;
