'use strict';

import { connect } from 'react-redux';
import { GlobalState } from '../../../types/globalTypes.ts';
import {
  setThreshold,
  setSelectedCommitType,
  setSelectedBranch,
  setSearchTerm,
  setFirstCommitTime,
  setMaxSessionLength,
  setUseActualTime, setUseRatio
} from './sagas';
import { Palette } from '../../../types/authorTypes.ts';
import styles from './styles.module.scss';
import * as React from 'react';
import {Commit} from "../../../types/commitTypes.ts";
import _ from "lodash";
import MultiRangeSlider from "multi-range-slider-react";
import "./sliderStyles.css";
import { MultiSelect } from "react-multi-select-component";

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
    searchTerm: dashboardState.config.searchTerm,
    firstCommitTime: dashboardState.config.firstCommitTime,
    maxSessionLength: dashboardState.config.maxSessionLength,
    useActualTime: dashboardState.config.useActualTime,
    useRatio: dashboardState.config.useRatio,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    onChangeThreshold: (threshold: {value: number, threshold: string}) => dispatch(setThreshold(threshold)),
    onChangeBranch: (branch: string) => dispatch(setSelectedBranch(branch)),
    onChangeCommitType: (commitType: string[]) => dispatch(setSelectedCommitType(commitType)),
    onChangeSearchTerm: (searchTerm: string) => dispatch(setSearchTerm(searchTerm)),
    onFirstCommitTime: (firstCommitTime: number) => dispatch(setFirstCommitTime(firstCommitTime)),
    onMaxSessionLength: (maxSessionLength: number) => dispatch(setMaxSessionLength(maxSessionLength)),
    onToggleUseActualTime: (actualTime: boolean) => dispatch(setUseActualTime(actualTime)),
    onToggleUseRatio: (useRatio: boolean) => dispatch(setUseRatio(useRatio)),
  };
};

interface Threshold {
  hours: { lower: number; upper: number };
  change: { lower: number; upper: number };
  ratio: { lower: number; upper: number };
}

interface Props {
  committers: string[];
  selectedBranch: string;
  branches: string[];
  commits: Commit[];
  mergedAuthors: any[];
  commitType: string[];
  threshold: Threshold;
  searchTerm: string;
  firstCommitTime: number;
  maxSessionLength: number;
  useActualTime: boolean;
  useRatio: boolean;
  palette: Palette;
  resolution: string;
  selectedAuthors: any[];
  onChangeThreshold: (threshold: {value: number, threshold: string}) => void;
  onChangeBranch: (branchName: string) => void;
  onChangeCommitType: (commitType: string[]) => void;
  onChangeSearchTerm: (searchTerm: string) => void;
  onFirstCommitTime: (firstCommitTime: number) => void;
  onMaxSessionLength: (maxSessionLength: number) => void;
  onToggleUseActualTime: (actualTime: boolean) => void;
  onToggleUseRatio: (useRatio: boolean) => void;
}

function setThresholds(commits: Commit[], props: Props) {
  if (!commits || !props.selectedAuthors) return {hours: {lower: 0, upper: 0}, change: {lower: 0, upper: 0}, ratio: {lower: 0, upper: 0}};

  const commitsWithDate = commits.map(commit => {
    return {...commit, date : new Date(commit.date), timeSpent: {estimated: 0, actual: 0}};
  })
  addActualTime(commitsWithDate);
  addEstimatedTime(commitsWithDate, props);
  const threshold = {
    hours: {
      lower: Math.min(...commitsWithDate.map(c => Math.min(c.timeSpent.estimated, c.timeSpent.actual))),
      upper: Math.max(...commitsWithDate.map(c => Math.max(c.timeSpent.estimated, c.timeSpent.actual)))
    },
    change: {
      lower: Math.min(...commitsWithDate.map(c => c.stats.deletions + c.stats.additions)),
      upper: Math.max(...commitsWithDate.map(c => c.stats.deletions + c.stats.additions))
    },
    ratio: {
      lower: Math.min(...commitsWithDate.map(c => {
        const changes = c.stats.deletions + c.stats.additions;
        const time = Math.min(c.timeSpent.estimated, c.timeSpent.actual) === 0 ? 1 :
          Math.max(c.timeSpent.estimated, c.timeSpent.actual);
        return changes/time;
      })),
      upper: Math.max(...commitsWithDate.map(c => {
        const changes = c.stats.deletions + c.stats.additions;
        const time = Math.max(c.timeSpent.estimated, c.timeSpent.actual) == 0 ? 1 :
          Math.max(c.timeSpent.estimated, c.timeSpent.actual);
        return changes/time;
      }))
    }
  };

  if (!props.threshold.hours.upper) {
    props.threshold.hours.upper = threshold.hours.upper;
  }
  if (!props.threshold.hours.lower) {
    props.threshold.hours.lower = threshold.hours.lower;
  }
  if (!props.threshold.change.upper) {
    props.threshold.change.upper = threshold.change.upper;
  }
  if (!props.threshold.change.lower) {
    props.threshold.change.lower = threshold.change.lower;
  }
  if (!props.threshold.ratio.upper) {
    props.threshold.ratio.upper = threshold.ratio.upper;
  }
  if (!props.threshold.ratio.lower) {
    props.threshold.ratio.lower = threshold.ratio.lower;
  }

  return threshold;
}

function addEstimatedTime(commits: any[], props: Props) {
  const firstCommitAdd = props.firstCommitTime;
  const maxCommitDiff = props.maxSessionLength;
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

function sliderInput(lowerInput: [number, React.Dispatch<React.SetStateAction<number>>],
                     upperInput: [number, React.Dispatch<React.SetStateAction<number>>],
                     inputFieldName: string,threshold: Threshold, props: Props) {
  
  return <div>
    <input
      className={'input'}
      type="text"
      value={lowerInput[0]}
      style={{display: 'inline', maxWidth: '100px'}}
      onChange={(e) => lowerInput[1](+e.target.value)}
      onBlur={(e) => {
        if (isNaN(+e.target.value) || +e.target.value >= props.threshold[inputFieldName].upper
          || +e.target.value < threshold[inputFieldName].lower) {
          lowerInput[1](props.threshold[inputFieldName].lower);
          return;
        }
        props.onChangeThreshold({value: +e.target.value, threshold: inputFieldName + '-lower'})
      }}
    />
    <MultiRangeSlider
      style={{margin: '0 10px'}}
      min={threshold[inputFieldName].lower}
      max={threshold[inputFieldName].upper}
      minValue={props.threshold[inputFieldName].lower}
      maxValue={props.threshold[inputFieldName].upper}
      canMinMaxValueSame={true}
      label={false}
      ruler={false}
      onChange={e => {
        props.onChangeThreshold({value: e.minValue, threshold: inputFieldName + '-lower'});
        props.onChangeThreshold({value: e.maxValue, threshold: inputFieldName + '-upper'});
        lowerInput[1](e.minValue);
        upperInput[1](e.maxValue);
      }}
    /><input
    className={'input'}
    type="text"
    value={upperInput[0]}
    style={{display: 'inline', maxWidth: '100px'}}
    onChange={(e) => upperInput[1](+e.target.value)}
    onBlur={(e) => {
      if (isNaN(+e.target.value) || +e.target.value <= props.threshold[inputFieldName].lower
        || +e.target.value > threshold[inputFieldName].upper) {
        upperInput[1](props.threshold[inputFieldName].upper);
        return;
      }
      props.onChangeThreshold({value: +e.target.value, threshold: inputFieldName + '-upper'})
    }}
  />
  </div>
}

const CommitTimeTrackingConfigComponent = (props: Props) => {
  if (!props.commits) return (
    <div>
      <h6 className={styles.loadingHint}>
        Loading... <i className="fas fa-spinner fa-pulse" />
      </h6>
    </div>);
  const threshold = setThresholds(props.commits, props);

  return (
    <div className={styles.configContainer}>
      <div className={styles.field}>
        <input
          id='useActualTime'
          type="checkbox"
          className={'switch is-rounded is-outlined is-info'}
          defaultChecked={props.useActualTime}
          onChange={(e) => props.onToggleUseActualTime(e.target.checked)}
        />
        <label htmlFor="useActualTime" className={styles.switch}>
          Use actual time
        </label>
        <br/>
        <input
          id='useRatio'
          type="checkbox"
          className={'switch is-rounded is-outlined is-info'}
          defaultChecked={props.useRatio}
          onChange={(e) => props.onToggleUseRatio(e.target.checked)}
        />
        <label htmlFor="useRatio" className={styles.switch}>
          Use line change/time ratio in chart
        </label>
        <label className="label">Branch</label>
        <div style={{ marginBottom: '0.5em' }}>
          <div className="select">
            <select value={props.selectedBranch} onChange={(e) => props.onChangeBranch(e.target.value)}>
              <option value="" key="">All branches</option>
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
        <label className="label">Thresholds</label>
        <div style={{ marginBottom: '0.5em' }}>
          <h2>Time spent</h2>
          {sliderInput(React.useState(props.threshold.hours.lower), React.useState(props.threshold.hours.upper),
            'hours', threshold, props)}
          <h2>Lines changed</h2>
          {sliderInput(React.useState(props.threshold.change.lower), React.useState(props.threshold.change.upper),
            'change', threshold, props)}
          <h2>Ratio</h2>
          {sliderInput(React.useState(props.threshold.ratio.lower), React.useState(props.threshold.ratio.upper),
            'ratio', threshold, props)}
        </div>

        <label className="label">Commit type</label>
        <MultiSelect
          options={[
            { label: 'corrective', value: 'corrective'},
            { label: 'features', value: 'features'},
            { label: 'perfective', value: 'perfective'},
            { label: 'nonfunctional', value: 'nonfunctional'},
            { label: 'unknown', value: 'unknown'}
          ]}
          value={props.commitType.map(type => {
            return {label: type, value: type};
          })}
          onChange={(selected: {label: string, value: string}[]) => props.onChangeCommitType(selected.map(s => s.value))}
          labelledBy={"Select commit type"}
        />

        <label className="label">Time estimation parameters</label>
        <h2>First commit time (in minutes):</h2>
        <input className={'input'} type="number" value={+props.firstCommitTime} onChange={(e) => props.onFirstCommitTime(+e.target.value)}/>
        <h2>Maximum session length (in minutes):</h2>
        <input className={'input'} type="number" value={+props.maxSessionLength} onChange={(e) => props.onMaxSessionLength(+e.target.value)}/>

        <label className="label">Search term</label>
        <input className={'input'}
                  onChange={(e) => props.onChangeSearchTerm(e.target.value)}/>
      </div>
    </div>
  );
};

const DashboardConfig = connect(mapStateToProps, mapDispatchToProps)(CommitTimeTrackingConfigComponent);

export default DashboardConfig;
