import { ReactNode } from 'react';
import { DataPlugin } from './dataPlugin.ts';
import { Author } from '../../types/authorType.ts';

export interface VisualizationPlugin<SettingsType> {
  name: string;
  chartComponent: (props: { settings: SettingsType; dataConnection: DataPlugin; authorList: Author[] }) => ReactNode;
  settingsComponent: (props: { defaultSettings: SettingsType; setSettings: (newSettings: SettingsType) => void }) => ReactNode;
  defaultSettings: unknown;
  capabilities: {
    popoutOnly: boolean;
  };
  images: {
    thumbnail: string;
  };
}
