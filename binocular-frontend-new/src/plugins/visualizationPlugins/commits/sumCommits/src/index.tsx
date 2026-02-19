import PreviewImage from '../assets/thumbnail.svg';
import Settings, { type SettingsType } from './settings/settings.tsx';
import type { VisualizationPlugin } from '../../../../interfaces/visualizationPlugin.ts';
import { getSVGData } from './utilities/utilities.ts';
import Reducer from '../../../simpleVisualizationPlugin/src/reducer';
import Saga from './saga';
import Help from './help/help.tsx';
import { convertToChartData } from './utilities/dataConverter.ts';
import type { DataPluginCommit } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';
import { VisualizationPluginMetadataCategory } from '../../../../interfaces/visualizationPluginInterfaces/visualizationPluginMetadata';

const SumCommits: VisualizationPlugin<SettingsType, DataPluginCommit> = {
  name: 'SumCommits',
  // ts-expect-error
  chartComponent: undefined,
  settingsComponent: Settings,
  helpComponent: Help,
  dataConverter: convertToChartData,
  dataConnectionName: 'commits',
  defaultSettings: { showMean: false, showOther: false },
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
    category: VisualizationPluginMetadataCategory.Commits,
    recommended: false,
    description: 'A bar chart which shows how manny commits each author has contributed over the time.',
    compatibility: { binocularBackend: true, githubAPI: true, mockData: true, pouchDB: true, github: true, gitlab: true },
  },
  reducer: Reducer,
  saga: Saga,
};

export default SumCommits;
