import HunkHandler from '../helper/hunkHandler';
import chartGeneration from './chartGeneration';

import _ from 'lodash';

export default class chartUpdater {
  static transformChangesPerVersionData(rawData, lines, path) {
    const data = [];
    let commits = 0;

    const legendSteps = 20;

    let maxValue = 0;

    for (const i in rawData.data) {
      const commit = rawData.data[i];
      for (let j = 0; j < lines; j++) {
        data.push({ column: i, row: j, value: 0, message: commit.message, sha: commit.sha, signature: commit.signature });
      }

      const files = commit.files.data;
      const file = _.filter(files, { file: { path: path } })[0];
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
    this.storedData = data;
    this.storedLines = lines;
    this.storedCommits = commits;
    this.storedMaxValue = maxValue;
    this.storedLegendSteps = legendSteps;
  }

  static transformChangesPerDeveloperData(rawData, lines, path) {
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
      const files = commit.files.data;
      const file = _.filter(files, { file: { path: path } })[0];
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
    this.storedData = data;
    this.storedLines = lines;
    this.storedDevs = devs;
    this.storedMaxValue = maxValue;
    this.storedLegendSteps = legendSteps;
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
    this.storedData = data;
    this.storedLines = lines;
    this.storedIssues = issues;
    this.storedMaxValue = maxValue;
    this.storedLegendSteps = legendSteps;
  }

  static generateCharts(currThis, mode) {
    chartGeneration.updateColumnData(this.storedData, currThis, mode);
    const importantColumns = currThis.combinedColumnData.map(d => d.column);

    chartGeneration.generateColumnChart(
      this.storedData,
      mode === 1 ? this.storedDevs.length : mode === 2 ? this.storedIssues.length : this.storedCommits,
      currThis,
      mode,
      this.storedLegendSteps
    );
    this.storedData = this.storedData.filter(d => importantColumns.includes(d.column));
    chartGeneration.generateRowSummary(this.storedData, this.storedLines, currThis, mode, this.storedLegendSteps);
    chartGeneration.generateHeatmap(
      this.storedData,
      this.storedLines,
      importantColumns,
      currThis,
      mode,
      this.storedMaxValue,
      this.storedLegendSteps
    );
  }

  static updateCharts(currThis, mode) {
    const importantColumns = currThis.combinedColumnData.map(d => d.column);
    setTimeout(
      function() {
        chartGeneration.updateColumnChart(
          this.storedData,
          mode === 1 ? this.storedDevs.length : mode === 2 ? this.storedIssues.length : this.storedCommits,
          currThis,
          mode,
          this.storedLegendSteps
        );
      }.bind(this)
    );
    this.storedData = this.storedData.filter(d => importantColumns.includes(d.column));

    setTimeout(
      function() {
        chartGeneration.updateRowSummary(this.storedData, this.storedLines, currThis, mode, this.storedLegendSteps);
      }.bind(this)
    );
    setTimeout(
      function() {
        chartGeneration.updateHeatmap(
          this.storedData,
          this.storedLines,
          importantColumns,
          currThis,
          mode,
          this.storedMaxValue,
          this.storedLegendSteps
        );
      }.bind(this)
    );
  }
}
