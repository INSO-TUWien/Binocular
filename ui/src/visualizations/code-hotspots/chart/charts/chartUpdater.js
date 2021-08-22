import HunkHandler from '../helper/hunkHandler';
import chartGeneration from './chartGeneration';

export default class chartUpdater {
  static transformChangesPerVersionData(rawData, lines) {
    const data = [];
    let commits = 0;

    const legendSteps = 20;

    let maxValue = 0;

    for (const i in rawData.data) {
      const commit = rawData.data[i];
      for (let j = 0; j < lines; j++) {
        data.push({
          column: i,
          row: j,
          value: 0,
          message: commit.message,
          sha: commit.sha,
          date: commit.date,
          branch: commit.branch,
          signature: commit.signature
        });
      }

      const file = commit.file;

      if (file !== undefined) {
        for (const j in file.hunks) {
          const hunk = file.hunks[j];
          const tmpMaxValue = HunkHandler.handle(hunk, data, i, maxValue);
          if (tmpMaxValue > maxValue) {
            maxValue = tmpMaxValue;
          }
        }
        commits++;
      }
    }
    return { data: data, lines: lines, commits: commits, maxValue: maxValue, legendSteps: legendSteps };
  }

  static transformChangesPerDeveloperData(rawData, lines) {
    const data = [];
    const legendSteps = 20;
    let maxValue = 0;
    const devs = [];
    for (const commit of rawData.data) {
      if (!devs.includes(commit.signature)) {
        devs.push(commit.signature);
      }
    }
    for (const i in devs) {
      for (let j = 0; j < lines; j++) {
        data.push({ column: i, row: j, value: 0, message: '', sha: '', dev: devs[i] });
      }
    }
    for (const i in rawData.data) {
      const commit = rawData.data[i];

      const file = commit.file;
      if (file !== undefined) {
        for (const j in file.hunks) {
          const hunk = file.hunks[j];
          const tmpMaxValue = HunkHandler.handle(hunk, data, devs.indexOf(commit.signature), maxValue);
          if (tmpMaxValue > maxValue) {
            maxValue = tmpMaxValue;
          }
        }
      }
    }
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

  static generateCharts(currThis, mode, data) {
    const combinedColumnData = chartGeneration.updateColumnData(data.data, currThis, mode);
    currThis.combinedColumnData = combinedColumnData;
    const importantColumns = combinedColumnData.map(d => d.column);
    chartGeneration.generateColumnChart(
      currThis.combinedColumnData,
      mode === 1 ? data.devs.length : mode === 2 ? data.issues.length : data.commits,
      currThis,
      mode,
      data.legendSteps
    );
    const filteredData = data.data.filter(d => importantColumns.includes(d.column));
    chartGeneration.generateRowSummary(filteredData, data.lines, currThis, mode, data.legendSteps, data.firstLineNumber);
    chartGeneration.generateHeatmap(
      filteredData,
      data.lines,
      importantColumns,
      currThis,
      mode,
      data.maxValue,
      data.legendSteps,
      data.firstLineNumber
    );
  }

  static updateCharts(currThis, mode, data) {
    const importantColumns = currThis.combinedColumnData.map(d => d.column);
    setTimeout(
      function() {
        chartGeneration.updateColumnChart(
          currThis.combinedColumnData,
          mode === 1 ? data.devs.length : mode === 2 ? data.issues.length : data.commits,
          currThis,
          mode,
          data.legendSteps
        );
      }.bind(this)
    );
    const filteredData = data.data.filter(d => importantColumns.includes(d.column));

    setTimeout(
      function() {
        chartGeneration.updateRowSummary(filteredData, data.lines, currThis, mode, data.legendSteps, data.firstLineNumber);
      }.bind(this)
    );
    setTimeout(
      function() {
        chartGeneration.updateHeatmap(
          filteredData,
          data.lines,
          importantColumns,
          currThis,
          mode,
          data.maxValue,
          data.legendSteps,
          data.firstLineNumber
        );
      }.bind(this)
    );
  }
}
