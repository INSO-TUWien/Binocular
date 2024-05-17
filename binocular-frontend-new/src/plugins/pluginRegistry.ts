import ExampleVisualization from './visualizations/exampleVisualization';
import ExampleStats from './visualizations/exampleStats';
import ExampleComplex from './visualizations/exampleComplex';
import { ReactNode } from 'react';

interface VisualizationPlugin {
  name: string;
  chartComponent: (props: { settings: unknown }) => ReactNode;
  settingsComponent: (props: { defaultSettings: unknown; setSettings: (newSettings: unknown) => void }) => ReactNode;
  defaultSettings: unknown;
  capabilities: {
    popoutOnly: boolean;
  };
  images: {
    preview: string;
  };
}

export const visualizationPlugins: VisualizationPlugin[] = [ExampleVisualization, ExampleStats, ExampleComplex];
