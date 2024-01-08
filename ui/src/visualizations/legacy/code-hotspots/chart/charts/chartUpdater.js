import chartGeneration from './chartGeneration';
import * as d3Collection from 'd3-collection';
import * as d3 from 'd3';

export default class chartUpdater {
  static transformChangesPerVersionData(rawData, lines) {
    const commits = 0;

    const legendSteps = 20;

    let maxValue = 0;
    const data = rawData.data
      .map((commit, i) => {
        const columnData = new Array(lines).fill({ value: 0 }, 0, lines).map((row, j) => {
          return {
            row: j,
            value: row.value,
            column: i,
            message: commit.message,
            sha: commit.sha,
            date: commit.date,
            branch: commit.branch,
            parents: commit.parents,
            history: commit.history,
            signature: commit.signature,
          };
        });
        if (commit.file !== undefined) {
          commit.file.hunks.forEach((hunk) => {
            columnData.filter((column) => {
              if (
                (column.row >= hunk.newStart - 1 && column.row < hunk.newStart + hunk.newLines - 1) ||
                (column.row >= hunk.oldStart - 1 && column.row < hunk.oldStart + hunk.oldLines - 1)
              ) {
                column.value = column.value + 1;
              }
              if (column.value > maxValue) {
                maxValue = column.value;
              }
              return column;
            });
          });
        }

        return columnData;
      })
      .flat();
    return { data: data, lines: lines, commits: commits, maxValue: maxValue, legendSteps: legendSteps };
  }

  static transformChangesPerDeveloperData(rawData, lines) {
    const legendSteps = 20;
    let maxValue = 0;

    const versionData = this.transformChangesPerVersionData(rawData, lines).data;
    const groupedDevData = d3Collection
      .nest()
      .key((k) => k.signature)
      .entries(versionData);

    const devs = groupedDevData.map((entry) => entry.key);
    const data = groupedDevData
      .map((entry, i) => {
        return d3Collection
          .nest()
          .key((k) => k.row)
          .rollup((d) => {
            const value = d3.sum(d, (v) => v.value);
            if (value > maxValue) {
              maxValue = value;
            }
            return { column: i, row: d[0].row, value: value, dev: d[0].signature, commits: d };
          })
          .entries(entry.values)
          .map((d) => d.value);
      })
      .flat();
    return { data: data, lines: lines, devs: devs, maxValue: maxValue, legendSteps: legendSteps };
  }

  static transformChangesPerIssueData(rawData, lines) {
    const legendSteps = 20;
    let maxValue = 0;
    const issues = [];

    const data = rawData.data
      .filter((issue) => issue.commits.data.length > 0)
      .map((issue, i) => {
        issues.push(issue.title);
        const columnData = new Array(lines).fill({ value: 0 }, 0, lines).map((row, j) => {
          return {
            row: j,
            value: row.value,
            column: i,
            title: issue.title,
            description: issue.description,
            iid: issue.iid,
            commits: [],
          };
        });
        issue.commits.data.forEach((commit) => {
          if (commit.file !== null) {
            commit.file.hunks.forEach((hunk) => {
              columnData.filter((column) => {
                if (
                  (column.row >= hunk.newStart - 1 && column.row < hunk.newStart + hunk.newLines - 1) ||
                  (column.row >= hunk.oldStart - 1 && column.row < hunk.oldStart + hunk.oldLines - 1)
                ) {
                  column.value = column.value + 1;
                }
                if (column.value > maxValue) {
                  maxValue = column.value;
                }
                column.commits.push({
                  message: commit.message,
                  sha: commit.sha,
                  date: commit.date,
                  branch: commit.branch,
                  parents: commit.parents,
                  signature: commit.signature,
                });
                return column;
              });
            });
          }
        });
        return columnData;
      })
      .flat();
    return { data: data, lines: lines, issues: issues, maxValue: maxValue, legendSteps: legendSteps };
  }

  static generateCharts(currThis, mode, data, displayProps) {
    let filteredData = data.data;

    if (mode === 0) {
      filteredData = data.data.filter(
        (d) =>
          new Date(d.date.split('.')[0]) >= new Date(displayProps.dateRange.from) &&
          new Date(d.date.split('.')[0]) <= new Date(displayProps.dateRange.to),
      );
    }

    const combinedColumnData = chartGeneration.updateColumnData(filteredData, currThis, mode);
    currThis.combinedColumnData = combinedColumnData;
    const importantColumns = combinedColumnData.map((d) => d.column);
    chartGeneration.generateColumnChart(
      currThis.combinedColumnData,
      mode === 1 ? data.devs.length : mode === 2 ? data.issues.length : data.commits,
      currThis,
      mode,
      data.legendSteps,
      displayProps,
    );
    filteredData = filteredData.filter((d) => importantColumns.includes(d.column));
    chartGeneration.generateRowSummary(filteredData, data.lines, currThis, mode, data.legendSteps, data.firstLineNumber, displayProps);
    chartGeneration.generateMainChart(
      filteredData,
      data.rawData,
      data.lines,
      importantColumns,
      currThis,
      mode,
      data.maxValue,
      data.legendSteps,
      data.firstLineNumber,
      displayProps,
    );
  }

  static updateColumnChart(currThis, mode, data, displayProps) {
    let filteredData = data.data;
    if (mode === 0) {
      filteredData = data.data.filter(
        (d) =>
          new Date(d.date.split('.')[0]) >= new Date(displayProps.dateRange.from) &&
          new Date(d.date.split('.')[0]) <= new Date(displayProps.dateRange.to),
      );
    }

    currThis.combinedColumnData = chartGeneration.updateColumnData(filteredData, currThis, mode);
    chartGeneration.generateColumnChart(
      currThis.combinedColumnData,
      mode === 1 ? data.devs.length : mode === 2 ? data.issues.length : data.commits,
      currThis,
      mode,
      data.legendSteps,
      displayProps,
    );
  }

  static updateMainChart(currThis, mode, data, displayProps) {
    let filteredData = data.data;
    if (mode === 0) {
      filteredData = data.data.filter(
        (d) =>
          new Date(d.date.split('.')[0]) >= new Date(displayProps.dateRange.from) &&
          new Date(d.date.split('.')[0]) <= new Date(displayProps.dateRange.to),
      );
    }
    const combinedColumnData = chartGeneration.updateColumnData(filteredData, currThis, mode);
    const importantColumns = combinedColumnData.map((d) => d.column);

    filteredData = filteredData.filter((d) => importantColumns.includes(d.column));
    chartGeneration.updateMainChart(
      filteredData,
      data.rawData,
      data.lines,
      importantColumns,
      currThis,
      mode,
      data.maxValue,
      data.legendSteps,
      data.firstLineNumber,
      displayProps,
    );
  }
}
