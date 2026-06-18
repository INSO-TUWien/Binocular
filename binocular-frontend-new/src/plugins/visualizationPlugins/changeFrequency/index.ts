import React from 'react';
import ChartComponent from './src/chart/chart';
import ConfigComponent from './src/settings/settings';
import HelpComponent from './src/help/help';
import saga from './src/saga';
import reducer from './src/reducer';
import { type VisualizationPlugin } from '../../interfaces/visualizationPlugin';
import { VisualizationPluginMetadataCategory } from '../../interfaces/visualizationPluginInterfaces/visualizationPluginMetadata';
import { getSVGData } from './src/utilities/utilities';
import ThumbnailImage from './assets/thumbnail.svg';

// The visualization has no user-facing settings; the date range comes from the global parameters and
// navigation state lives in the per-instance store (surfaced via the in-chart "Directory" tab).
export type ChangeFrequencySettings = Record<string, never>;

const SettingsWrapper = () => {
  return React.createElement(ConfigComponent);
};

const HelpWrapper = () => {
  return React.createElement(HelpComponent);
};

const ChangeFrequency: VisualizationPlugin<ChangeFrequencySettings, unknown> = {
  name: 'Change Frequency',
  chartComponent: ChartComponent,
  settingsComponent: SettingsWrapper,
  helpComponent: HelpWrapper,
  dataConnectionName: 'commits',
  defaultSettings: {},
  export: {
    getSVGData: getSVGData,
  },
  capabilities: {
    popoutOnly: false,
    export: true,
  },
  images: {
    thumbnail: ThumbnailImage,
  },
  metadata: {
    category: VisualizationPluginMetadataCategory.Commits,
    recommended: false,
    description: 'A chart that visualizes how frequently files in the repository are changed over time.',
    compatibility: { binocularBackend: true, githubAPI: true, mockData: true, pouchDB: true, github: true, gitlab: true },
  },
  reducer,
  saga,
};

export default ChangeFrequency;
