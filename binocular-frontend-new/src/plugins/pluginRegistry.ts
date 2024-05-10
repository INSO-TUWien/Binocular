import ExampleVisualization from './visualizations/exampleVisualization';

export interface VisualizationPlugin {
  name: string;
  chart: unknown;
  images: {
    preview: string;
  };
}

export const visualizationPlugins: VisualizationPlugin[] = [ExampleVisualization];
