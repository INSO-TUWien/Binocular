import chroma from 'chroma-js';
import _ from 'lodash';
import { DataPluginCommit } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';
import { AuthorType } from '../../../../../types/data/authorType.ts';
import { Properties } from '../../../simpleVisualizationPlugin/src/interfaces/properties.ts';
import { SettingsType } from '../settings/settings.tsx';

interface BarChartData {
  user: string;
  value: number;
  segments?: { label: string; value: number }[];
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

  const combinedGroups = props.settings?.combinedUsers ?? [];

  /**
   * Count the number of commits per user
   */
  const countsByUser = _.countBy(commits, (c) => c.user.gitSignature);

  /**
   * Create the chart data
   */
  const chartData: BarChartData[] = [];
  const palette: Palette = {};

  /**
   * Add the data for each author
   */
  const selectedIds = new Set<string>();
  const knownIds = new Set(props.authorList.map((a) => a.user.id));
  props.authorList.forEach((author: AuthorType) => {
    if (!author.selected) return;

    const label = author.displayName || author.user.gitSignature;
    const total = countsByUser[author.user.gitSignature] ?? 0;

    selectedIds.add(author.user.id);

    palette[author.user.gitSignature] = {
      main: chroma(author.color.main).hex(),
      secondary: chroma(author.color.secondary).hex(),
    };

    const isGrouped = combinedGroups.some((group) => group.includes(author.user.gitSignature));
    if (isGrouped) return;

    chartData.push({ user: label, value: total });
  });

  combinedGroups.forEach((group) => {
    const activeSegs = group.filter((sig) => props.authorList.find((a) => a.user.gitSignature === sig && a.selected));

    if (activeSegs.length < 2) return;

    const value = group.reduce((sum, sig) => sum + (countsByUser[sig] ?? 0), 0);
    if (value === 0) return;

    const label = group.join(' + ');

    const segments = activeSegs.map((sig) => ({
      label: sig,
      value: countsByUser[sig] ?? 0,
    }));

    chartData.push({ user: label, value, segments });
  });

  /* optional: sum up commits from unknown users */
  if (props.settings.showOther) {
    const unknown = commits.filter((c) => !knownIds.has(c.user.id)).length;
    if (unknown > 0) {
      chartData.push({ user: 'others', value: unknown });
      palette['others'] = { main: '#555555', secondary: '#777777' };
    }
  }

  /**
   * Scale
   */
  const max = _.max(chartData.map((d) => d.value)) ?? 0;
  const scale: number[] = [0, max];

  return { chartData, scale, palette };
}
