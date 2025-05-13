import moment from 'moment/moment';
import chroma from 'chroma-js';
import _ from 'lodash';
import { DataPluginCommit } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';
import { AuthorType } from '../../../../../types/data/authorType.ts';
import { Properties } from '../../../simpleVisualizationPlugin/src/interfaces/properties.ts';
import { SettingsType } from '../settings/settings.tsx';

interface BarChartData {
  user: string;
  value: number;
  avgCommitsPerWeek: number;
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

  /**
   * Get time interval and filter out commits not in between the given dates
   */

  const from = moment(props.parameters.parametersDateRange.from);
  const to = moment(props.parameters.parametersDateRange.to);

  commits = commits.filter((c) => {
    const date = moment(c.date);
    const afterFrom = date.isSameOrAfter(from);
    const beforeTo = date.isSameOrBefore(to);

    return afterFrom && beforeTo;
  });

  /**
   * Count the number of commits per user
   */
  const combinedGroups = props.settings?.combinedUsers ?? [];
  const countsByUser = _.countBy(commits, (c) => c.user.gitSignature);
  const commitsByUser = _.groupBy(commits, (c) => c.user.gitSignature);

  /**
   * Calculate the average commits per week
   */
  const avgCommitsPerWeek = (userCommits: DataPluginCommit[]): number => {
    if (userCommits.length === 0) return 0;
    const dates = userCommits.map((c) => new Date(c.date));
    const minDate = _.min(dates) ?? new Date();
    const maxDate = _.max(dates) ?? new Date();
    //Use Math.max because otherwise it will say infinity if commits == 1
    const weeks = Math.max(1, Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24 * 7)));

    return Number((userCommits.length / weeks).toFixed(2));
  };

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

    chartData.push({ user: label, value: total, avgCommitsPerWeek: avgCommitsPerWeek(commitsByUser[author.user.gitSignature] ?? []) });
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
