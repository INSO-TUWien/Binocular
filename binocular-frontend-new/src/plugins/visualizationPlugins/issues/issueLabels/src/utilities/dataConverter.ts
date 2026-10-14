import moment from 'moment/moment';
import type { ChartData, Palette } from '../../../../../../components/stackedAreaChart/StackedAreaChart.tsx';
import type { DataPluginIssue, DataPluginIssueCommitStats } from '../../../../../interfaces/dataPluginInterfaces/dataPluginIssues.ts';
import type { ParametersType } from '../../../../../../types/parameters/parametersType.ts';

const PALETTE: Palette = {
  additions: { main: '#4caf50', secondary: '#81c784' },
  deletions: { main: '#f44336', secondary: '#e57373' },
};

export function convertToChartData(
  issues: DataPluginIssue[],
  selectedLabels: string[],
  parameters: ParametersType,
): { chartData: ChartData[]; scale: number[]; palette: Palette } {
  if (!issues || issues.length === 0) {
    return { chartData: [], scale: [], palette: {} };
  }

  const matchingIssues = issues.filter((issue) => selectedLabels.every((label) => issue.labels.includes(label)));

  const commitsBySha = new Map<string, DataPluginIssueCommitStats>();
  for (const issue of matchingIssues) {
    for (const commit of issue.commits ?? []) {
      commitsBySha.set(commit.sha, commit);
    }
    for (const mergeRequest of issue.mergeRequests ?? []) {
      for (const commit of mergeRequest.commits ?? []) {
        commitsBySha.set(commit.sha, commit);
      }
    }
  }

  const commits = [...commitsBySha.values()].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  if (commits.length === 0) {
    return { chartData: [], scale: [], palette: {} };
  }

  const granularity = getGranularity(parameters.parametersGeneral.granularity);
  const durationUnit = <moment.unitOfTime.DurationConstructor>parameters.parametersGeneral.granularity;
  const curr = moment(commits[0].date)
    .startOf(granularity.unit as moment.unitOfTime.StartOf)
    .subtract(1, durationUnit);
  const end = moment(commits[commits.length - 1].date)
    .endOf(granularity.unit as moment.unitOfTime.StartOf)
    .add(1, durationUnit);
  const next = moment(curr).add(1, durationUnit);

  const chartData: ChartData[] = [];
  const scale: number[] = [0, 0];
  let i = 0;
  for (; curr.isSameOrBefore(end); curr.add(1, durationUnit), next.add(1, durationUnit)) {
    const currTimestamp = curr.toDate().getTime();
    const nextTimestamp = next.toDate().getTime();

    let additions = 0;
    let deletions = 0;
    for (; i < commits.length && Date.parse(commits[i].date) < nextTimestamp; i++) {
      additions += commits[i].stats.additions;
      deletions += commits[i].stats.deletions;
    }

    chartData.push({ date: currTimestamp, additions, deletions: -deletions });
    if (additions > scale[1]) scale[1] = additions;
    if (-deletions < scale[0]) scale[0] = -deletions;
  }

  return { chartData, scale, palette: PALETTE };
}

function getGranularity(resolution: string): { unit: string } {
  switch (resolution) {
    case 'years':
      return { unit: 'year' };
    case 'months':
      return { unit: 'month' };
    case 'weeks':
      return { unit: 'week' };
    case 'days':
    default:
      return { unit: 'day' };
  }
}
