import { UniversalSettings } from './unversalSettingsTypes';

export interface GlobalState {
  activeConfigTab: string;
  activeVisualization: string;
  config: any;
  notifications: any;
  progress: any;
  showHelp: boolean;
  universalSettings: UniversalSettings;
  visualizations: any;
}

export interface DateRange {
  from: string | undefined;
  to: string | undefined;
}
