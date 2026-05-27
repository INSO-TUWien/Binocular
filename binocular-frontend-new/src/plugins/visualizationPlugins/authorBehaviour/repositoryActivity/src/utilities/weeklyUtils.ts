import * as d3 from 'd3';
import {
  type AnyActivityDataPlugin,
  type HeatmapCell,
  type ActivityType,
  getActivityType,
  getActivityDate,
  isDataPluginCommit,
  ACTIVITY_TYPES,
} from './types';

interface CellActivityData {
  total: number;
  counts: Record<ActivityType, number>;
  activities: AnyActivityDataPlugin[];
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

function getActivityDescription(activity: AnyActivityDataPlugin): string {
  if (isDataPluginCommit(activity)) {
    return activity.message || activity.messageHeader || 'No message';
  }
  // Add more descriptions for other types as needed
  return 'Activity';
}

export function convertToWeeklyFormat(
  data: AnyActivityDataPlugin[],
  // props: any[],  use it for further variations
  weekStart: Date,
): {
  chartData: HeatmapCell[];
  rowLabels: string[];
  colLabels: string[];
} {
  const chartData: HeatmapCell[] = [];

  // Calculate week end (7 days after start)
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  // Filter activities to only those within the week
  const weekActivities = data.filter((activity) => {
    const activityDate = getActivityDate(activity);
    if (!activityDate) return false;
    return activityDate >= weekStart && activityDate < weekEnd;
  });

  // Initialize grid
  const grid: Map<string, CellActivityData> = new Map();

  // Pre-fill all cells
  for (let hour = 0; hour < 24; hour++) {
    for (let day = 0; day < 7; day++) {
      grid.set(`${hour}-${day}`, { total: 0, counts: createEmptyCounts(), activities: [] });
    }
  }

  // Group activities
  weekActivities.forEach((activity) => {
    const activityDate = getActivityDate(activity);
    if (!activityDate) return;

    const activityType = getActivityType(activity);

    // Calculate days from week start
    const daysDiff = Math.floor((activityDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
    const hour = activityDate.getHours();
    const key = `${hour}-${daysDiff}`;

    const cellData = grid.get(key);
    if (cellData) {
      cellData.total += 1;
      cellData.counts[activityType] += 1;
      cellData.activities.push(activity);
    }
  });

  // Convert to HeatmapCell array
  for (let hour = 0; hour < 24; hour++) {
    for (let day = 0; day < 7; day++) {
      const cellData = grid.get(`${hour}-${day}`)!;
      const cellDate = new Date(weekStart);
      cellDate.setDate(cellDate.getDate() + day);
      cellDate.setHours(hour, 0, 0, 0);

      // Build tooltip with activity details grouped by type
      let tooltip = `<strong>${d3.timeFormat('%b %d, %Y')(cellDate)} at ${hour}:00</strong>`;

      if (cellData.total > 0) {
        // Group activities by type for the tooltip
        const groupedByType = new Map<ActivityType, AnyActivityDataPlugin[]>();
        cellData.activities.forEach((activity) => {
          const type = getActivityType(activity);
          if (!groupedByType.has(type)) {
            groupedByType.set(type, []);
          }
          groupedByType.get(type)!.push(activity);
        });

        // Add details for each type
        groupedByType.forEach((activities, type) => {
          const typeInfo = ACTIVITY_TYPES[type];
          const count = activities.length;
          const label = count === 1 ? typeInfo.singular : typeInfo.plural;
          tooltip += `<br/><u>${count} ${label}:</u>`;
          activities.forEach((activity) => {
            tooltip += `<br/>• ${getActivityDescription(activity)}`;
          });
        });
      } else {
        tooltip += `<br/>0 activities`;
      }

      chartData.push({
        row: day,
        col: hour,
        value: cellData.total,
        tooltip,
      });
    }
  }

  // Generate labels (transposed: days as rows, hours as columns)
  const rowLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const colLabels = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  return {
    chartData: chartData,
    rowLabels,
    colLabels,
  };
}
