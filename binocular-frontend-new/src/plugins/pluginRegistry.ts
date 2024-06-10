import Commits from './visualizationPlugins/changes';
import ExampleVisualization from './visualizationPlugins/exampleVisualization';
import ExampleStats from './visualizationPlugins/exampleStats';
import ExampleComplex from './visualizationPlugins/exampleComplex';

import BinocularBackend from './dataPlugins/binocularBackend';
import MockData from './dataPlugins/mockData';

import { VisualizationPlugin } from './interfaces/visualizationPlugin.ts';
import { DataPlugin } from './interfaces/dataPlugin.ts';

export const visualizationPlugins: VisualizationPlugin[] = [Commits, ExampleVisualization, ExampleStats, ExampleComplex];

//Order = priority used when nothing selected by the user.
export const dataPlugins: DataPlugin[] = [MockData, BinocularBackend];
