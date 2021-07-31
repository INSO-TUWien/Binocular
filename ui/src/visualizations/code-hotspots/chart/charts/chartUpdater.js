import HunkHandler from '../helper/hunkHandler';
import chartGeneration from './chartGeneration';

import _ from 'lodash';

let storedData;
let storedLines;
let storedCommits;
let storedDevs;
let storedIssues;
let storedMaxValue;
let storedLegendSteps;
let mode = 0;
let currThis;

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

  static transformChangesPerIssueData(rawData, lines, path) {
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

  static updateCharts(currThis, mode) {
    this.mode = mode;
    this.currThis = currThis;
    chartGeneration.generateRowSummary(this.storedData, this.storedLines, this.currThis, this.mode, this.storedLegendSteps);
    chartGeneration.generateHeatmap(
      this.storedData,
      this.storedLines,
      this.mode === 1 ? this.storedDevs.length : this.mode === 2 ? this.storedIssues.length : this.storedCommits,
      this.currThis,
      this.mode,
      this.storedMaxValue,
      this.storedLegendSteps
    );
    chartGeneration.generateBarChart(
      this.storedData,
      this.mode === 1 ? this.storedDevs.length : this.mode === 2 ? this.storedIssues.length : this.storedCommits,
      this.currThis,
      this.mode,
      this.storedLegendSteps
    );
  }
}
