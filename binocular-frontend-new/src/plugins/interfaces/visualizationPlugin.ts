import { ReactNode } from 'react';
import { DataPlugin } from './dataPlugin.ts';

export interface VisualizationPlugin<SettingsType> {
  name: string;
  chartComponent: (props: { settings: SettingsType; dataConnection: DataPlugin }) => ReactNode;
  settingsComponent: (props: { defaultSettings: SettingsType; setSettings: (newSettings: SettingsType) => void }) => ReactNode;
  defaultSettings: unknown;
  capabilities: {
    popoutOnly: boolean;
  };
  images: {
    thumbnail: string;
  };
}
