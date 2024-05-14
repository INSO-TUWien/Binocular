import ExampleVisualization from './visualizations/exampleVisualization';
import ExampleStats from './visualizations/exampleStats';
import { ReactNode } from 'react';

interface VisualizationPlugin {
  name: string;
  chartComponent: (props: { settings: unknown }) => ReactNode;
  settingsComponent: (props: { defaultSettings: unknown; setSettings: (newSettings: unknown) => void }) => ReactNode;
  defaultSettings: unknown;
  images: {
    preview: string;
  };
}

export const visualizationPlugins: VisualizationPlugin[] = [ExampleVisualization, ExampleStats];
