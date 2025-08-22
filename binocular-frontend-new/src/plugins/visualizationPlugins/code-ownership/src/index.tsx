import Chart from './chart/chart.tsx';
import Settings, { type CodeOwnerShipSettings } from './settings/settings.tsx';
import Help from './help/help';
import Saga from './saga';
import Reducer from './reducer';
import type { VisualizationPlugin } from '../../../interfaces/visualizationPlugin.ts';
import PreviewImage from '../assets/thumbnail.svg';
import { VisualizationPluginMetadataCategory } from '../../../interfaces/visualizationPluginInterfaces/visualizationPluginMetadata.ts';

const CodeOwnership: VisualizationPlugin<CodeOwnerShipSettings, null> = {
  name: 'Code Ownership',
  chartComponent: Chart,
  settingsComponent: Settings,
  helpComponent: Help,
  defaultSettings: {
    hideMergeCommitSettings: true,
    hideSprintSettings: true,
    displayMode: 'absolute',
    currentBranch: undefined,
    allBranches: [],
  },
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
  metadata: {
    category: VisualizationPluginMetadataCategory.Ownership,
    recommended: false,
    description: 'Shows how many lines are owned by which author over time.',
  },
  reducer: Reducer,
  saga: Saga,
};
export default CodeOwnership;
