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

  const selectedIds = new Set<string>();
  const knownIds = new Set(props.authorList.map((author) => author.user.id));
  props.authorList.forEach((author: AuthorType) => {
    if (!author.selected) return;
    const label = author.displayName || author.user.gitSignature;
    const total = countsByUser[author.user.id] ?? 0;

    selectedIds.add(author.user.id);

    chartData.push({ user: label, value: total });

    palette[label] = {
      main: chroma(author.color.main).hex(),
      secondary: chroma(author.color.secondary).hex(),
    };
  });

  /* optional: sum up commits from unknown users */
  /* TODO: Make it so unknown users get shown when being optionally enabled
  const knownSum = _.sum(chartData.map((d) => d.value));
  const unknown = commits.length - knownSum;
  */
  const unknown = commits.filter((c) => !knownIds.has(c.user.id)).length;
  if (unknown > 0) {
    chartData.push({ user: 'others', value: unknown });
    palette['others'] = { main: '#555555', secondary: '#777777' };
  }

  /**
   * Scale
   */
  const max = _.max(chartData.map((d) => d.value)) ?? 0;
  const scale: number[] = [0, max];

  return { chartData, scale, palette };
}
