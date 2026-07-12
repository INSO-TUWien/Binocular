import _ from 'lodash';
import type { DataPluginLizard } from '../../../../../interfaces/dataPluginInterfaces/dataPluginLizard.ts';
import type { VisualizationPluginProperties } from '../../../../../interfaces/visualizationPluginInterfaces/visualizationPluginProperties.ts';
import type { LizardSettings } from '../settings/settings.tsx';

interface ColumnChartData {
  filePath: string;
  label: string;
  value: number;

  maxNloc: number;
  maxCcn: number;
  maxTokens: number;
  maxParameters: number;
  maxLength: number;

  avgNloc: number;
  avgCcn: number;
  avgTokens: number;
  avgParameters: number;
  avgLength: number;

  functionCount: number;

  maxLizardScore: number;
  avgLizardScore: number;
  normalizedMaxLizardScore: number;
  normalizedAvgLizardScore: number;
}

interface Palette {
  [key: string]: { main: string; secondary: string };
}

function shortenFilePath(filePath: string): string {
  const normalized = filePath.replaceAll('\\', '/');
  const parts = normalized.split('/');
  return parts[parts.length - 1] || filePath;
}

function calculateScore(row: DataPluginLizard, maxWeight: number): number {
  const avgWeight = 1 - maxWeight;

  return row.normalizedMaxLizardScore * maxWeight + row.normalizedAvgLizardScore * avgWeight;
}

export function convertToChartData(
  lizardRows: DataPluginLizard[],
  props: VisualizationPluginProperties<LizardSettings, DataPluginLizard>,
): {
  chartData: ColumnChartData[];
  scale: number[];
  palette: Palette;
} {
  if (!lizardRows || lizardRows.length === 0) {
    return { chartData: [], palette: {}, scale: [0, 0] };
  }

  const maxWeight = props.settings.maxWeight ?? 0.5;
  const topN = props.settings.topN ?? 5;

  let chartData: ColumnChartData[] = lizardRows.map((row) => ({
    filePath: row.filePath,
    label: shortenFilePath(row.filePath),
    value: calculateScore(row, maxWeight),

    maxNloc: row.maxNloc,
    maxCcn: row.maxCcn,
    maxTokens: row.maxTokens,
    maxParameters: row.maxParameters,
    maxLength: row.maxLength,

    avgNloc: row.avgNloc,
    avgCcn: row.avgCcn,
    avgTokens: row.avgTokens,
    avgParameters: row.avgParameters,
    avgLength: row.avgLength,

    functionCount: row.functionCount,

    maxLizardScore: row.maxLizardScore,
    avgLizardScore: row.avgLizardScore,
    normalizedMaxLizardScore: row.normalizedMaxLizardScore,
    normalizedAvgLizardScore: row.normalizedAvgLizardScore,
  }));

  chartData = chartData.sort((a, b) => b.value - a.value);

  if (topN > 0) {
    chartData = chartData.slice(0, topN);
  }

  const max = _.max(chartData.map((d) => d.value)) ?? 0;

  return {
    chartData,
    scale: [0, max],
    palette: {},
  };
}
