'use strict';

import { connect } from 'react-redux';
import { GlobalState } from '../../../types/globalTypes.ts';
import { setThreshold, setSelectedCommitType, setSelectedBranch } from './sagas';
import { Palette } from '../../../types/authorTypes.ts';
import styles from './styles.module.scss';
import * as React from 'react';
import {Commit} from "../../../types/commitTypes.ts";
import _ from "lodash";

const mapStateToProps = (state: GlobalState) => {
  const dashboardState = state.visualizations.commitTimeTracking.state;
  return {
    committers: dashboardState.data.data.committers,
    resolution: dashboardState.config.chartResolution,
    palette: dashboardState.data.data.palette,
    selectedBranch: dashboardState.config.selectedBranch,
    branches: dashboardState.data.data.branches,
    commitType: dashboardState.config.commitType,
    threshold: dashboardState.config.threshold,
    selectedAuthors: state.universalSettings.selectedAuthorsGlobal,
    commits: dashboardState.data.data.commits,
    mergedAuthors: state.universalSettings.mergedAuthors,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    onChangeThreshold: (threshold: {value: number, threshold: string}) => dispatch(setThreshold(threshold)),
    onChangeBranch: (branch: string) => dispatch(setSelectedBranch(branch)),
    onChangeCommitType: (commitType: string) => dispatch(setSelectedCommitType(commitType)),
  };
};

interface Props {
  committers: string[];
  selectedBranch: string;
  branches: string[];
  commits: Commit[];
  mergedAuthors: any[];
  commitType: string;
  threshold: {
    hours: { lower: number; upper: number };
    change: { lower: number; upper: number };
    ratio: { lower: number; upper: number };
  };
  palette: Palette;
  resolution: string;
  selectedAuthors: any[];
  onChangeThreshold: (threshold: {value: number, threshold: string}) => void;
  onChangeBranch: (branchName: string) => void;
  onChangeCommitType: (commitType: string) => void;
}

function calculateThresholds(commits: Commit[], props: Props) {
  if (!commits || !props.selectedAuthors) return;

  const commitsWithDate = commits.map(commit => {
    return {...commit, date : new Date(commit.date), timeSpent: {estimated: 0, actual: 0}};
  })
  addActualTime(commitsWithDate);
  addEstimatedTime(commitsWithDate, props);
  return {
    hours: {
      lower: Math.min(...commitsWithDate.map(c => c.timeSpent.estimated)),
      upper: Math.max(...commitsWithDate.map(c => c.timeSpent.estimated))
    },
    change: {
      lower: Math.min(...commitsWithDate.map(c => c.stats.deletions + c.stats.additions)),
      upper: Math.max(...commitsWithDate.map(c => c.stats.deletions + c.stats.additions))
    },
    ratio: {
      lower: Math.min(...commitsWithDate.map(c => {
        const changes = c.stats.deletions + c.stats.additions;
        const time = c.timeSpent.estimated;
        return changes/time;
      })),
      upper: Math.max(...commitsWithDate.map(c => {
        const changes = c.stats.deletions + c.stats.additions;
        const time = c.timeSpent.estimated === 0 ? 1 : c.timeSpent.estimated;
        return changes/time;
      }))
    }
  };
}

function addEstimatedTime(commits: any[], props: Props) {
  const firstCommitAdd = 120; // TODO: Replace constant with variable from state;
  const maxCommitDiff = 120; // TODO: Replace constant with variable from state;
  const mergedAuthors = props.mergedAuthors;
  mergedAuthors.forEach(mergedAuthor => {
    const filteredCommits = commits.filter(commit => _.map(mergedAuthor.committers, 'signature').includes(commit.signature));
    if (!filteredCommits || filteredCommits.length === 0) {
      return;
    }
    filteredCommits[0].timeSpent.estimated = firstCommitAdd;
    let prevCommit = filteredCommits.shift();
    let curCommit = filteredCommits.shift();
    while (curCommit != null) {
      if ((curCommit.date.getTime() - prevCommit.date.getTime()) / 1000 / 60 > maxCommitDiff) {
        curCommit.timeSpent.estimated = firstCommitAdd;
      } else {
        curCommit.timeSpent.estimated = Math.round((curCommit.date.getTime() - prevCommit.date.getTime()) / 1000 / 60);
      }
      prevCommit = curCommit;
      curCommit = filteredCommits.shift();
    }
  });
}

function addActualTime(commits: any[]) {
  return commits.forEach(c => {
    let timeSpent = 0;
    const regex = 'Time-spent: [0-9]*h[0-9]*m';

    const timeStamp = c.message.match(regex);
    if (timeStamp) {
      const time = timeStamp.split(' ')[1];
      timeSpent = +time.substring(0, time.indexOf('h')) * 60
        + +time.substring(time.indexOf('h') + 1, time.indexOf('m'));
    }
    c.timeSpent.actual = timeSpent;
  });
}

const CommitTimeTrackingConfigComponent = (props: Props) => {
  const threshold = calculateThresholds(props.commits, props);
  console.log(threshold);
  return (
    <div className={styles.configContainer}>
      <div className={styles.field}>
        <label className="label">Branch</label>
        <div style={{ marginBottom: '0.5em' }}>
          <div className="select">
            <select value={props.selectedBranch} onChange={(e) => props.onChangeBranch(e.target.value)}>
              {props.branches
                ? props.branches.map((b) => (
                    <option value={b} key={b}>
                      {b}
                    </option>
                  ))
                : 'Nothing'}
            </select>
          </div>
        </div>
        <label className="label">Threshold</label>
        <div style={{ marginBottom: '0.5em' }}>
          <label className="label">Time spent</label>
          <label className="label">Lower bound</label>
          <input
            type="number"
            value={props.threshold.hours.lower}
            onChange={(e) => props.onChangeThreshold({ value: +e.target.value, threshold: 'hours-lower'})}
          />
          <label className="label">Upper bound</label>
          <input
            type="number"
            value={props.threshold.hours.upper}
            onChange={(e) => props.onChangeThreshold({ value: +e.target.value, threshold: 'hours-upper'})}
          />
          <label className="label">Lines changed</label>
          <label className="label">Lower bound</label>
          <input
            type="number"
            value={props.threshold.change.lower}
            onChange={(e) => props.onChangeThreshold({ value: + e.target.value, threshold: 'change-lower'})}
          />
          <label className="label">Upper bound</label>
          <input
            type="number"
            value={props.threshold.change.upper}
            onChange={(e) => props.onChangeThreshold({ value: + e.target.value, threshold: 'change-upper'})}
          />
          <label className="label">Ratio</label>
          <label className="label">Lower bound</label>
          <input
            type="number"
            value={props.threshold.ratio.lower}
            onChange={(e) => props.onChangeThreshold({ value: + e.target.value, threshold: 'ratio-lower'})}
          />
          <label className="label">Upper bound</label>
          <input
            type="number"
            value={props.threshold.ratio.upper}
            onChange={(e) => props.onChangeThreshold({ value: + e.target.value, threshold: 'ratio-upper'})}
          />
        </div>

        <label className="label">Commit type</label>
        <div style={{ marginBottom: '0.5em' }}>
          <div className="select">
            <select value={props.commitType} onChange={(e) => props.onChangeCommitType(e.target.value)}>
              <option value="all">All</option>
              <option value="corrective">Corrective</option>
              <option value="features">Features</option>
              <option value="perfective">Perfective</option>
              <option value="nonfunctional">Non-Functional</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardConfig = connect(mapStateToProps, mapDispatchToProps)(CommitTimeTrackingConfigComponent);

export default DashboardConfig;
