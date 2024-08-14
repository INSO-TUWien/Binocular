import Commits from './visualizationPlugins/changes';
import ExampleVisualization from './visualizationPlugins/exampleVisualization';
import ExampleStats from './visualizationPlugins/exampleStats';
import ExampleComplex from './visualizationPlugins/exampleComplex';

import MockData from './dataPlugins/mockData';
import BinocularBackend from './dataPlugins/binocularBackend';
import Github from './dataPlugins/github';

import { VisualizationPlugin } from './interfaces/visualizationPlugin.ts';

//The implicit type here has to be any because every Visualization plugin has a different settings type implied
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const visualizationPlugins: VisualizationPlugin<any>[] = [Commits, ExampleVisualization, ExampleStats, ExampleComplex];

//Order = priority used when nothing selected by the user.
export const dataPlugins = [MockData, BinocularBackend, Github];
