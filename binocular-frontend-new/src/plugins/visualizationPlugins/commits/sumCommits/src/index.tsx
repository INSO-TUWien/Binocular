import PreviewImage from '../assets/bar-chart.svg';
import Settings, { type SumSettings } from './settings/settings.tsx';
import type { VisualizationPlugin } from '../../../../interfaces/visualizationPlugin.ts';
import { getSVGData } from './utilities/utilities.ts';
import Reducer from './reducer';
import Saga from './saga';
import Help from './help/help.tsx';
import type { DataPluginCommit } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';
import { VisualizationPluginMetadataCategory } from '../../../../interfaces/visualizationPluginInterfaces/visualizationPluginMetadata';
import Chart from './chart/chart.tsx';

const SumCommits: VisualizationPlugin<SumSettings, DataPluginCommit> = {
  name: 'Sum Commits',
  chartComponent: Chart,
  settingsComponent: Settings,
  helpComponent: Help,
  dataConnectionName: 'commits',
  defaultSettings: { showMean: false, showOther: false, minCommits: 0, topN: 0 },
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
    description: 'A bar chart which visualizes how many commits an author has pushed to the repository over time.',
    compatibility: { binocularBackend: true, githubAPI: true, mockData: true, pouchDB: true, github: true, gitlab: true },
  },
  reducer: Reducer,
  saga: Saga,
};

export default SumCommits;
