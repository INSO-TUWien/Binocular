import HunkHandler from '../helper/hunkHandler';
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
        let rowData = new Array(lines).fill({ value: 0 }, 0, lines).map((row, j) => {
          return {
            row: j,
            value: row.value,
            column: i,
            message: commit.message,
            sha: commit.sha,
            date: commit.date,
            branch: commit.branch,
            parents: commit.parents,
            signature: commit.signature
          };
        });
        if (commit.file !== undefined) {
          commit.file.hunks.forEach(hunk => {
            rowData = rowData.filter(row => {
              if (
                (row.row >= hunk.newStart - 1 && row.row < hunk.newStart + hunk.newLines - 1) ||
                (row.row >= hunk.oldStart - 1 && row.row < hunk.oldStart + hunk.oldLines - 1)
              ) {
                row.value = row.value + 1;
              }
              if (row.value > maxValue) {
                maxValue = row.value;
              }
              return row;
            });
          });
        }

        return rowData;
      })
      .flat();
    return { data: data, lines: lines, commits: commits, maxValue: maxValue, legendSteps: legendSteps };
  }

  static transformChangesPerDeveloperData(rawData, lines) {
    const legendSteps = 20;
    let maxValue = 0;

    const versionData = this.transformChangesPerVersionData(rawData, lines).data;
    const groupedDevData = d3Collection.nest().key(k => k.signature).entries(versionData);

    const devs = groupedDevData.map(entry => entry.key);
    const data = groupedDevData
      .map((entry, i) => {
        return d3Collection
          .nest()
          .key(k => k.row)
          .rollup(d => {
            const value = d3.sum(d, v => v.value);
            if (value > maxValue) {
              maxValue = value;
            }
            return { column: i, row: d[0].row, value: value, dev: d[0].signature };
          })
          .entries(entry.values)
          .map(d => d.value);
      })
      .flat();
    return { data: data, lines: lines, devs: devs, maxValue: maxValue, legendSteps: legendSteps };
  }

  static transformChangesPerIssueData(rawData, lines) {
    const data = [];
    const legendSteps = 20;
    let maxValue = 0;
    const issues = [];
    const issuesDescriptions = [];
    const issuesIID = [];
    for (const issue of rawData.data) {
      if (!issues.includes(issue.title)) {
        issues.push(issue.title);
        issuesDescriptions.push(issue.description);
        issuesIID.push(issue.iid);
      }
    }
    for (const i in issues) {
      for (let j = 0; j < lines; j++) {
        data.push({
          column: i,
          row: j,
          value: 0,
          message: '',
          sha: '',
          title: issues[i],
          description: issuesDescriptions[i],
          iid: issuesIID[i]
        });
      }
    }
    for (const i in rawData.data) {
      const issue = rawData.data[i];
      for (const j in issue.commits.data) {
        const commit = issue.commits.data[j];
        const file = commit.file;
        if (file !== null) {
          for (const k in file.hunks) {
            const hunk = file.hunks[k];
            const tmpMaxValue = HunkHandler.handle(hunk, data, issues.indexOf(issue.title), maxValue);
            if (tmpMaxValue > maxValue) {
              maxValue = tmpMaxValue;
            }
          }
        }
      }
    }

    return { data: data, lines: lines, issues: issues, maxValue: maxValue, legendSteps: legendSteps };
  }

  static generateCharts(currThis, mode, data, displayProps) {
    let filteredData = data.data;
    if (mode === 0) {
      filteredData = data.data.filter(
        d => new Date(d.date) >= new Date(displayProps.dateRange.from) && new Date(d.date) <= new Date(displayProps.dateRange.to)
      );
    }

    const combinedColumnData = chartGeneration.updateColumnData(filteredData, currThis, mode);
    currThis.combinedColumnData = combinedColumnData;
    const importantColumns = combinedColumnData.map(d => d.column);
    chartGeneration.generateColumnChart(
      currThis.combinedColumnData,
      mode === 1 ? data.devs.length : mode === 2 ? data.issues.length : data.commits,
      currThis,
      mode,
      data.legendSteps,
      displayProps
    );
    filteredData = filteredData.filter(d => importantColumns.includes(d.column));
    chartGeneration.generateRowSummary(filteredData, data.lines, currThis, mode, data.legendSteps, data.firstLineNumber, displayProps);
    chartGeneration.generateHeatmap(
      filteredData,
      data.lines,
      importantColumns,
      currThis,
      mode,
      data.maxValue,
      data.legendSteps,
      data.firstLineNumber,
      displayProps
    );
  }
}
