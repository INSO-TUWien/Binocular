import * as d3 from 'd3';
import { type AnyActivityDataPlugin, type ActivityType, getActivityType, getActivityDate, formatActivityCounts } from './types';

interface DayActivityData {
  total: number;
  counts: Record<ActivityType, number>;
}

function createEmptyCounts(): Record<ActivityType, number> {
  return {
    commit: 0,
    build: 0,
    issue: 0,
    mergeRequest: 0,
    note: 0,
    branch: 0,
    unknown: 0,
  };
}

export function convertToActivityTimelineFormat(
  data: AnyActivityDataPlugin[],
  // props: VisualizationPluginProperties<RepositoryActivitySettings, AnyActivityDataPlugin>, use it for further variations
): {
  chartData: Array<{ date: Date; value: number; tooltip?: string }>;
} {
  const activityPerDay = new Map<string, DayActivityData>();

  data.forEach((d) => {
    const date = getActivityDate(d);
    if (!date) return;

    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const activityType = getActivityType(d);

    if (!activityPerDay.has(dateKey)) {
      activityPerDay.set(dateKey, { total: 0, counts: createEmptyCounts() });
    }

    const dayData = activityPerDay.get(dateKey)!;
    dayData.total += 1;
    dayData.counts[activityType] += 1;
  });

  // Convert map to array of objects
  const chartData = Array.from(activityPerDay.entries()).map(([dateStr, dayData]) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return {
      date,
      value: dayData.total,
      tooltip: `<strong>${d3.timeFormat('%b %d, %Y')(date)}</strong><br/>${formatActivityCounts(dayData.counts)}`,
    };
  });

  // Sort by date
  chartData.sort((a, b) => a.date.getTime() - b.date.getTime());

  return { chartData: chartData };
}
