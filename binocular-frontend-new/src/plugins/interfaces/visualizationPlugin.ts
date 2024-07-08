import { ReactNode } from 'react';
import { DataPlugin } from './dataPlugin.ts';
import { Author } from '../../types/authorType.ts';
import { ParametersInitialState } from '../../redux/parametersReducer.ts';
import { Sprint } from '../../types/sprintType.ts';

export interface VisualizationPlugin<SettingsType> {
  name: string;
  chartComponent: (props: {
    settings: SettingsType;
    dataConnection: DataPlugin;
    authorList: Author[];
    sprintList: Sprint[];
    parameters: ParametersInitialState;
  }) => ReactNode;
  settingsComponent: (props: { settings: SettingsType; setSettings: (newSettings: SettingsType) => void }) => ReactNode;
  defaultSettings: unknown;
  export: {
    getSVGData: () => string;
  };
  capabilities: {
    popoutOnly: boolean;
    export: boolean;
  };
  images: {
    thumbnail: string;
  };
}
