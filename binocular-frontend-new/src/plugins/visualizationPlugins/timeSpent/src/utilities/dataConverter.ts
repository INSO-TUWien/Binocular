import moment from 'moment/moment';
import { Properties } from '../../../simpleVisualizationPlugin/src/interfaces/properties.ts';
import { DataPluginTimeSpent } from '../../../../interfaces/dataPluginInterfaces/dataPluginTimeSpent.ts';
import { TimeSpentSettings } from '../../../simpleVisualizationPlugin/src/settings/settings.tsx';

interface TimeSpentChartData {
  date: number;
  [signature: string]: number;
}

interface Palette {
  [signature: string]: { main: string; secondary: string };
}

export function convertToChartData(
  entries: DataPluginTimeSpent[],
  props: Properties<TimeSpentSettings, DataPluginTimeSpent>,
): {
  chartData: TimeSpentChartData[];
  scale: number[];
  palette: Palette;
} {
  console.log(entries);
  if (!entries || entries.length === 0) {
    return { chartData: [], palette: {}, scale: [] };
  }
  props.authorList;
  getGranularity('test');
  return { chartData: [], palette: {}, scale: [] };
}

function getGranularity(resolution: string): { unit: string; interval: moment.Duration } {
  switch (resolution) {
    case 'years':
      return { interval: moment.duration(1, 'year'), unit: 'year' };
    case 'months':
      return { interval: moment.duration(1, 'month'), unit: 'month' };
    case 'weeks':
      return { interval: moment.duration(1, 'week'), unit: 'week' };
    case 'days':
    default:
      return { interval: moment.duration(1, 'day'), unit: 'day' };
  }
}
