import React from 'react';
import ChartComponent from './src/chart/chart';
import ConfigComponent from './src/settings/settings';
import HelpComponent from './src/help/help';
import saga from './src/saga';
import reducer from './src/reducer';
import { VisualizationPlugin } from '../../interfaces/visualizationPlugin';
import { getSVGData } from './src/utilities/utilities';
import ThumbnailImage from './assets/thumbnail.svg';

export interface ChangeFrequencySettings {
  commitSpan: [string, string];
}

const SettingsWrapper = (_props: { settings: ChangeFrequencySettings; setSettings: (newSettings: ChangeFrequencySettings) => void }) => {
  return React.createElement(ConfigComponent);
};

const HelpWrapper = () => {
  return React.createElement(HelpComponent);
};

const ChangeFrequency: VisualizationPlugin<ChangeFrequencySettings, any> = {
  name: 'Change Frequency',
  chartComponent: ChartComponent,
  settingsComponent: SettingsWrapper,
  helpComponent: HelpWrapper,
  dataConnectionName: 'commits',
  defaultSettings: {
    commitSpan: [new Date(0).toISOString(), new Date().toISOString()],
  },
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
  reducer,
  saga,
};

export default ChangeFrequency;
