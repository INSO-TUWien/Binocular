import chroma from 'chroma-js';
import _ from 'lodash';
import { DataPluginCommit } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';
import { AuthorType } from '../../../../../types/data/authorType.ts';
import { Properties } from '../../../simpleVisualizationPlugin/src/interfaces/properties.ts';
import { SettingsType } from '../settings/settings.tsx';

interface BarChartData {
  user: string;
  value: number;
}

interface Palette {
  [signature: string]: { main: string; secondary: string };
}

export function convertToChartData(
  commits: DataPluginCommit[],
  props: Properties<SettingsType, DataPluginCommit>,
): {
  chartData: BarChartData[];
  scale: number[];
  palette: Palette;
} {
  if (!commits || commits.length === 0) {
    return { chartData: [], palette: {}, scale: [0, 0] };
  }

  /**
   * Count the number of commits per user
   */
  const countsByUser = _.countBy(commits, (c) => c.user.id);

  /**
   * Create the chart data
   */
  const chartData: BarChartData[] = [];
  const palette: Palette = {};

  /**
   * Add the data for each author
   */
  props.authorList.forEach((author: AuthorType) => {
    const label = author.displayName || author.user.gitSignature;
    const total = countsByUser[author.user.id] ?? 0;

    chartData.push({ user: label, value: total });

    palette[label] = {
      main: chroma(author.color.main).hex(),
      secondary: chroma(author.color.secondary).hex(),
    };
  });

  /* optional: sum up commits from unknown users */
  const knownSum = _.sum(chartData.map((d) => d.value));
  const unknown = commits.length - knownSum;
  if (unknown > 0) {
    chartData.push({ user: 'others', value: unknown });
    palette['others'] = { main: '#555555', secondary: '#777777' };
  }

  const max = _.max(chartData.map((d) => d.value)) ?? 0;
  const scale: number[] = [0, max];

  return { chartData, scale, palette };
}
