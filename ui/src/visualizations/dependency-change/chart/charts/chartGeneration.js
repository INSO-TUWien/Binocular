import heatmapChartGeneration from './subCharts/heatmapChartGeneration';
import rowChartGeneration from './subCharts/rowChartGeneration';
import columnChartGeneration from './subCharts/columnChartGeneration';

export default class chartGeneration {
  static generateHeatmap(data, lines, importantColumns, currThis, mode, maxValue, legendSteps, firstLineNumber, displayProps) {
    heatmapChartGeneration.generateHeatmap(
      data,
      lines,
      importantColumns,
      currThis,
      mode,
      maxValue,
      legendSteps,
      firstLineNumber,
      displayProps
    );
  }

  static updateHeatmap(data, lines, importantColumns, currThis, mode, maxValue, legendSteps, firstLineNumber, displayProps) {
    heatmapChartGeneration.updateHeatmap(
      data,
      lines,
      importantColumns,
      currThis,
      mode,
      maxValue,
      legendSteps,
      firstLineNumber,
      displayProps
    );
  }

  static generateRowSummary(data, lines, currThis, mode, legendSteps, firstLineNumber, displayProps) {
    rowChartGeneration.generateRowSummary(data, lines, currThis, mode, legendSteps, firstLineNumber, displayProps);
  }

  static updateRowSummary(data, lines, currThis, mode, legendSteps, firstLineNumber, displayProps) {
    rowChartGeneration.updateRowSummary(data, lines, currThis, mode, legendSteps, firstLineNumber, displayProps);
  }

  static updateColumnData(data, currThis, mode) {
    return columnChartGeneration.updateColumnData(data, currThis, mode);
  }

  static generateColumnChart(data, columns, currThis, mode, legendSteps, displayProps) {
    columnChartGeneration.generateColumnChart(data, columns, currThis, mode, legendSteps, displayProps);
  }

  static updateColumnChart(data, columns, currThis, mode, legendSteps, displayProps) {
    columnChartGeneration.updateColumnChart(data, columns, currThis, mode, legendSteps, displayProps);
  }

  static generateBranchView(data, columns, currThis) {
    columnChartGeneration.generateBranchView(data, columns, currThis);
  }
}
