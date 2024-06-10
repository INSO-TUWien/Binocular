import { ReactNode } from 'react';
import { DataPlugin } from './dataPlugin.ts';

export interface VisualizationPlugin {
  name: string;
  chartComponent: (props: { settings: unknown; dataConnection: DataPlugin }) => ReactNode;
  settingsComponent: (props: { defaultSettings: unknown; setSettings: (newSettings: unknown) => void }) => ReactNode;
  defaultSettings: unknown;
  capabilities: {
    popoutOnly: boolean;
  };
  images: {
    preview: string;
  };
}
