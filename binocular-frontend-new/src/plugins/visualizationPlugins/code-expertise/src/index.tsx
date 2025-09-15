import PreviewImage from '../assets/thumbnail.svg';
import Settings, { type BranchSettings } from './settings/settings.tsx';
import type { VisualizationPlugin } from '../../../interfaces/visualizationPlugin';
import { getSVGData } from './utilities/utilities';
import type { ExpertiseData } from './reducer';
import Reducer from './reducer';
import Saga from './saga/index';
import Help from './help/help';
import Chart from './chart/chart';
import { VisualizationPluginMetadataCategory } from '../../../interfaces/visualizationPluginInterfaces/visualizationPluginMetadata.ts';

const CodeExpertise: VisualizationPlugin<BranchSettings, ExpertiseData> = {
  name: 'Code Expertise',
  chartComponent: Chart,
  settingsComponent: Settings,
  helpComponent: Help,
  defaultSettings: {
    hideMergeCommitSettings: true,
    hideSprintSettings: true,
    currentBranch: undefined,
    allBranches: [],
  },
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
  metadata: {
    category: VisualizationPluginMetadataCategory.Expertise,
    recommended: false,
    description: 'Shows expertise of developers over the scope of the whole project.',
  },
  reducer: Reducer,
  saga: Saga,
};

export default CodeExpertise;
