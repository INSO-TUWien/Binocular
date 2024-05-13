import ExampleVisualization from './visualizations/exampleVisualization';
import { ReactNode } from 'react';

interface VisualizationPlugin {
  name: string;
  chart: () => ReactNode;
  images: {
    preview: string;
  };
}

export const visualizationPlugins: VisualizationPlugin[] = [ExampleVisualization];
