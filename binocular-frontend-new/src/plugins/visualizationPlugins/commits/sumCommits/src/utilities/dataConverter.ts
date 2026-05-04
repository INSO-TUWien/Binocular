import chroma from 'chroma-js';
import _ from 'lodash';
import type { DataPluginCommit } from '../../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';
import type { AuthorType } from '../../../../../../types/data/authorType.ts';
import type { VisualizationPluginProperties } from '../../../../../interfaces/visualizationPluginInterfaces/visualizationPluginProperties.ts';
import type { SumSettings } from '../settings/settings.tsx';

interface ColumnChartData {
  user: string;
  gitSignature: string;
  value: number;
  avgCommitsPerWeek: number;
  segments?: { label: string; gitSignature: string; value: number }[];
}

interface Palette {
  [signature: string]: { main: string; secondary: string };
}

export function convertToChartData(
  commits: DataPluginCommit[],
  props: VisualizationPluginProperties<SumSettings, DataPluginCommit>,
): {
  chartData: ColumnChartData[];
  scale: number[];
  palette: Palette;
} {
  if (!commits || commits.length === 0) {
    return { chartData: [], palette: {}, scale: [0, 0] };
  }

  /**
   * Count the number of commits per user
   */
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
  const chartData: ColumnChartData[] = [];
  const palette: Palette = {};
  const parentAuthors = props.authorList.filter((a) => a.parent === -1 && a.selected);
  const knownIds = new Set(props.authorList.map((a) => a.user.id));

  function trimLabel(label: string): string {
    const maxLength = 15;
    const trimmed = label.trim();
    const match = trimmed.match(/^(.+?)\s*<([^>]+)>$/);

    let result = trimmed;
    if (match) {
      const name = match[1].trim();
      const email = match[2].trim();
      result = name || email;
    }

    if (result.length <= maxLength) {
      return result;
    }

    return result.slice(0, maxLength) + '...';
  }

  parentAuthors.forEach((parentAuthor: AuthorType) => {
    const mergedAuthors = [parentAuthor, ...props.authorList.filter((a) => a.parent === parentAuthor.id)];
    mergedAuthors.forEach((a) => {
      palette[a.user.gitSignature] = {
        main: chroma(a.color.main).hex(),
        secondary: chroma(a.color.secondary).hex(),
      };
    });
    const signatures = mergedAuthors.map((a) => a.user.gitSignature);

    const total = _.sumBy(signatures, (sig) => countsByUser[sig] ?? 0);
    const mergedCommits = _.flatMap(signatures, (sig) => commitsByUser[sig] ?? []);

    const label = trimLabel(parentAuthor.user.gitSignature);

    chartData.push({
      user: label,
      gitSignature: parentAuthor.user.gitSignature,
      value: total,
      avgCommitsPerWeek: avgCommitsPerWeek(mergedCommits),
      segments:
        mergedAuthors.length > 1
          ? mergedAuthors.map((a) => ({
              label: trimLabel(a.user.gitSignature),
              gitSignature: a.user.gitSignature,
              value: countsByUser[a.user.gitSignature] ?? 0,
            }))
          : undefined,
    });
  });

  /**
   *  optional: sum up commits from unknown users
   */
  if (props.settings.showOther) {
    const unknown = commits.filter((c) => !knownIds.has(c.user.id));
    if (unknown.length > 0) {
      chartData.push({
        user: 'others',
        value: unknown.length,
        avgCommitsPerWeek: avgCommitsPerWeek(unknown),
        gitSignature: 'others',
      });
      palette['others'] = { main: '#555555', secondary: '#777777' };
    }
  }

  /**
   * Scale
   */
  const minCommits = props.settings.minCommits ?? 0;
  const topN = props.settings.topN ?? 0;

  let filteredChartData = chartData.filter((d) => d.value >= minCommits).sort((a, b) => b.value - a.value);

  if (topN > 0) {
    filteredChartData = filteredChartData.slice(0, topN);
  }

  const max = _.max(filteredChartData.map((d) => d.value)) ?? 0;
  const scale: number[] = [0, max];

  return { chartData: filteredChartData, scale, palette };
}
