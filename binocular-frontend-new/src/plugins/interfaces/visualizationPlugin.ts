import { ReactNode } from 'react';
import { DataPlugin } from './dataPlugin.ts';
import { AuthorType } from '../../types/data/authorType.ts';
import { ParametersInitialState } from '../../redux/parameters/parametersReducer.ts';
import { SprintType } from '../../types/data/sprintType.ts';
import {Action, Store} from "@reduxjs/toolkit";

export interface VisualizationPlugin<SettingsType> {
  name: string;
  chartComponent: (props: {
    settings: SettingsType;
    dataConnection: DataPlugin;
    authorList: AuthorType[];
    sprintList: SprintType[];
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
  store: Store<unknown, Action, unknown>;
}
