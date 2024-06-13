import { ReactNode } from 'react';
import { DataPlugin } from './dataPlugin.ts';
import { Author } from '../../types/authorType.ts';
import { ParametersInitialState } from '../../redux/parametersReducer.ts';

export interface VisualizationPlugin<SettingsType> {
  name: string;
  chartComponent: (props: {
    settings: SettingsType;
    dataConnection: DataPlugin;
    authorList: Author[];
    parameters: ParametersInitialState;
  }) => ReactNode;
  settingsComponent: (props: { settings: SettingsType; setSettings: (newSettings: SettingsType) => void }) => ReactNode;
  defaultSettings: unknown;
  capabilities: {
    popoutOnly: boolean;
  };
  images: {
    thumbnail: string;
  };
}
