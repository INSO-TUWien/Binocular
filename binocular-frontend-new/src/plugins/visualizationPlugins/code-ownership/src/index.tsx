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
      latestCommit: '5f13d85a7c3a2e62711e5e78f79f04854ecc5907',
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
