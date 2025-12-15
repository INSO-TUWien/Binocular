import {type AnyActivityDataPlugin, type HeatmapCell, isDataPluginCommit } from './types';

export function convertToWeeklyFormat(
  data: AnyActivityDataPlugin[],
  props: any[],
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

  // Filter commits to only those within the week
  const weekCommits = data.filter((commit) => {
    if (isDataPluginCommit(commit)) {
      const commitDate = new Date(commit.date);
      return commitDate >= weekStart && commitDate < weekEnd;
    }
  });

  // Initialize grid with commit messages
  const grid: Map<string, DataPluginCommit[]> = new Map();

  // Pre-fill all cells with empty arrays
  for (let hour = 0; hour < 24; hour++) {
    for (let day = 0; day < 7; day++) {
      grid.set(`${hour}-${day}`, []);
    }
  }

  // Group commits
  weekCommits.forEach((commit) => {
    if (isDataPluginCommit(commit)) {
      const commitDate = new Date(commit.date);
      console.log(commit.messageHeader)

      // Calculate days from week start
      const daysDiff = Math.floor((commitDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));

      const hour = commitDate.getHours();
      const key = `${hour}-${daysDiff}`;
      const existing = grid.get(key) || [];
      grid.set(key, [...existing, commit]);
    }
  });

  // Convert to HeatmapCell array
  for (let hour = 0; hour < 24; hour++) {
    for (let day = 0; day < 7; day++) {
      const commitsInCell = grid.get(`${hour}-${day}`) || [];
      const count = commitsInCell.length;
      const cellDate = new Date(weekStart);
      cellDate.setDate(cellDate.getDate() + day);
      cellDate.setHours(hour, 0, 0, 0);

      // Build tooltip with commit messages
      let tooltip = `${count} commit${count !== 1 ? 's' : ''} on ${cellDate.toLocaleDateString()} at ${hour}:00<br/>`;
      if (count > 0) {
        tooltip += commitsInCell.map((c) => `• ${c?.message}`).join('<br/>');
      }

      chartData.push({
        row: hour,
        col: day,
        value: count,
        tooltip,
      });
    }
  }

  // Generate labels
  const colLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const rowLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  return {
    chartData: chartData,
    rowLabels,
    colLabels,
  };
}
