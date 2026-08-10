import type { ReactNode, RefObject } from 'react';
import type { DataPlugin } from './dataPlugin.ts';
import type { Reducer, Store } from '@reduxjs/toolkit';
import type { ChartData, Palette } from '../../components/stackedAreaChart/StackedAreaChart.tsx';
import type { VisualizationPluginProperties } from './visualizationPluginInterfaces/visualizationPluginProperties.ts';
import type { VisualizationPluginMetadata } from './visualizationPluginInterfaces/visualizationPluginMetadata.ts';
import type { VisualizationPluginDependencies } from './visualizationPluginInterfaces/visualizationPluginDependencies.ts';

export interface VisualizationPlugin<SettingsType, DataType> {
  name: string;
  chartComponent?: (props: VisualizationPluginProperties<SettingsType, DataType>) => ReactNode;
  // settingsComponent can optionally receive the store as a prop, to change settings from the chart if needed, look at repositoryStats settings for an example
  settingsComponent: (props: { settings: SettingsType; setSettings: (newSettings: SettingsType) => void; store?: Store }) => ReactNode;
  helpComponent: () => ReactNode;
  // dataConnectionName and dataConverter only strictly needed when using the simpleVisualizationPlugin class
  dataConnectionName?: string;
  // optional
  dataConverter?: (
    data: DataType[],
    props: VisualizationPluginProperties<SettingsType, DataType>,
  ) => { chartData: ChartData[]; scale: number[]; palette: Palette };
  defaultSettings: unknown;
  export: {
    getSVGData: (chartContainerRef: RefObject<HTMLDivElement | null>) => string; // method that extracts and returns a svg element as a string from a RefObject
  };
  capabilities: {
    //capabilities that the visualization can fulfill
    popoutOnly: boolean;
    export: boolean;
    usesGlobalParameters?: boolean;
  };
  dependencies?: VisualizationPluginDependencies;
  images: {
    // media a visualization provides for Binocular
    thumbnail: string;
  };
  metadata: VisualizationPluginMetadata;
  reducer: Reducer;
  saga: (dataConnection: DataPlugin, name?: string, dataConnectionName?: string) => Generator;
}
