import type { VisualizationPluginProperties } from '../../../../interfaces/visualizationPluginInterfaces/visualizationPluginProperties';
import type { RepositoryActivitySettings } from '../settings/settings';
import { type AnyActivityDataPlugin, isDataPluginCommit } from './types';

export function convertToCalendarFormat(
  data: AnyActivityDataPlugin[],
  props: VisualizationPluginProperties<RepositoryActivitySettings, AnyActivityDataPlugin>,
): {
  chartData: Array<{ date: Date; value: number; tooltip?: string }>;
} {
  const activityPerDay = new Map();

  data.forEach((d) => {
    if (isDataPluginCommit(d)) {
      const date = new Date(d.date);
      const dateKey = date.toISOString().split('T')[0];

      if (activityPerDay.has(dateKey)) {
        activityPerDay.set(dateKey, activityPerDay.get(dateKey) + 1);
      } else {
        activityPerDay.set(dateKey, 1);
      }
    }
  });

  // Convert map to array of objects
  const chartData = Array.from(activityPerDay.entries()).map(([dateStr, count]) => ({
    date: new Date(dateStr),
    value: count,
    tooltip: `${count} commit${count !== 1 ? 's' : ''} on ${dateStr}`,
  }));

  // Sort by date
  chartData.sort((a, b) => a.date - b.date);

  return { chartData: chartData };
}
