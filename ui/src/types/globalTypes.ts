import { IUniversalSettings } from './unversalSettingsTypes';

export interface IGlobalState {
  activeConfigTab: string;
  activeVisualization: string;
  config: any;
  notifications: any;
  progress: any;
  showHelp: boolean;
  universalSettings: IUniversalSettings;
  visualizations: any;
}

export interface IDateRange {
  from?: string;
  to?: string;
}
