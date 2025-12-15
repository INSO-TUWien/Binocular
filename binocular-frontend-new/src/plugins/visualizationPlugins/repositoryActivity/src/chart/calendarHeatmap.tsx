import { useMemo } from 'react';
import * as d3 from 'd3';
import type { CalendarHeatmapProps, HeatmapCell } from '../utilities/types';
import Heatmap from './heatmap';

function CalendarHeatmap({
  data,
  startDate,
  endDate,
  minCellSize = 15,
  color = '#3182bd',
  cellPadding = 2,
  onCellClick = null,
  showLegend = true,
  legendTitle = 'Contributions',
}: CalendarHeatmapProps) {
  const { gridData, rowLabels, colLabels } = useMemo(() => {
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthLabels: string[] = [];
    const gridData: HeatmapCell[] = [];

    const dataMap = new Map<string, { value: number; tooltip?: string }>();
    data.forEach((item) => {
      const dateStr = item.date.toISOString().split('T')[0];
      dataMap.set(dateStr, { value: item.value, tooltip: item.tooltip });
    });

    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const weeks = Math.ceil(totalDays / 7);

    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() - currentDate.getDay());

    let currentMonth = -1;
    let colIndex = 0;

    for (let week = 0; week < weeks; week++) {
      const weekStartDate = new Date(currentDate);
      const month = weekStartDate.getMonth();

      if (month !== currentMonth) {
        monthLabels.push(d3.timeFormat('%b')(weekStartDate));
        currentMonth = month;
      } else {
        monthLabels.push('');
      }

      for (let day = 0; day < 7; day++) {
        const cellDate = new Date(currentDate);
        const dateStr = cellDate.toISOString().split('T')[0];
        const cellData = dataMap.get(dateStr);

        const isInRange = cellDate >= startDate && cellDate <= endDate;

        gridData.push({
          row: day,
          col: colIndex,
          value: isInRange && cellData ? cellData.value : 0,
          tooltip:
            cellData?.tooltip ||
            (isInRange ? `<strong>${d3.timeFormat('%b %d, %Y')(cellDate)}</strong><br/>${cellData?.value || 0} contributions` : ''),
          metadata: { date: new Date(cellDate), isInRange },
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      colIndex++;
    }

    return { gridData, rowLabels: dayLabels, colLabels: monthLabels };
  }, [data, startDate, endDate]);

  return (
    <Heatmap
      data={gridData}
      rowLabels={rowLabels}
      colLabels={colLabels}
      minCellSize={minCellSize}
      color={color}
      cellPadding={cellPadding}
      showLegend={showLegend}
      legendTitle={legendTitle}
      onCellClick={onCellClick}
    />
  );
}

export default CalendarHeatmap;
