import PreviewImage from '../assets/thumbnail.svg';
import Settings, { type SettingsType } from './settings/settings.tsx';
import type { VisualizationPlugin } from '../../../interfaces/visualizationPlugin.ts';
import Reducer from './reducer';
import Saga from './saga';
import Help from './help/help.tsx';
import type { DataPluginCommitFile } from '../../../interfaces/dataPluginInterfaces/dataPluginCommitsFiles.ts';
import Chart from './chart/chart.tsx';
import { VisualizationPluginMetadataCategory } from '../../../interfaces/visualizationPluginInterfaces/visualizationPluginMetadata';

const CommitByFile: VisualizationPlugin<SettingsType, DataPluginCommitFile> = {
  name: 'Commit By File',
  chartComponent: Chart,
  settingsComponent: Settings,
  dataConnectionName: 'commitByFile',
  helpComponent: Help,
  defaultSettings: { sha: '' },
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
    category: VisualizationPluginMetadataCategory.Commits,
    recommended: false,
    description: 'A tree map that visualizes the changes in a selected commit.',
    defaultSize: [14, 8],
    compatibility: { binocularBackend: true, githubAPI: false, mockData: true, pouchDB: false, github: true, gitlab: true },
  },
  reducer: Reducer,
  saga: Saga,
};
export default CommitByFile;
