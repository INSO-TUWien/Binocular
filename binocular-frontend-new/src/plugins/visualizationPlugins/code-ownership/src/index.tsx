import Chart from './chart/chart.tsx';
import Settings, { CodeOwnerShipSettings } from './settings/settings.tsx';
import Help from './help/help';
import Saga from './saga';
import Reducer from './reducer';
import { VisualizationPlugin } from '../../../interfaces/visualizationPlugin.ts';
import PreviewImage from '../assets/thumbnail.svg';

const CodeOwnership: VisualizationPlugin<CodeOwnerShipSettings, null> = {
  name: 'Code Ownership',
  chartComponent: Chart,
  settingsComponent: Settings,
  helpComponent: Help,
  defaultSettings: {
    hideMergeCommitSettings: true,
    hideSprintSettings: true,
    displayMode: 'absolute',
    currentBranch: {
      branch: 'develop',
      active: 'false',
      tracksFileRenames: 'true',
      latestCommit: 'b41e4505fe31b63a0ce047607ced1a4b7b66d1bb',
    },
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
  reducer: Reducer,
  saga: Saga,
};
export default CodeOwnership;
