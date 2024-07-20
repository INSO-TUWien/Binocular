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
  setUseActualTime
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

const CommitTimeTrackingConfigComponent = (props: Props) => {
  if (!props.commits) return (
    <div>
      <h6 className={styles.loadingHint}>
        Loading... <i className="fas fa-spinner fa-pulse" />
      </h6>
    </div>);
  const threshold = setThresholds(props.commits, props);
  const [hoursLowerInput, setHoursLowerInput] = React.useState(props.threshold.hours.lower);
  const [hoursUpperInput, setHoursUpperInput] = React.useState(props.threshold.hours.upper);
  const [changesLowerInput, setChangesLowerInput] = React.useState(props.threshold.change.lower);
  const [changesUpperInput, setChangesUpperInput] = React.useState(props.threshold.change.upper);
  const [ratioLowerInput, setRatioLowerInput] = React.useState(props.threshold.ratio.lower);
  const [ratioUpperInput, setRatioUpperInput] = React.useState(props.threshold.ratio.upper);

  return (
    <div className={styles.configContainer}>
      <div className={styles.field}>

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
          <div>
            <input
              id='useActualTime'
              type="checkbox"
              className={'switch is-rounded is-outlined is-info'}
              defaultChecked={props.useActualTime}
              onChange={(e) => props.onToggleUseActualTime(e.target.checked)}
            />
            <label htmlFor="useActualTime" className={styles.switch}>
              Use Actual Time
            </label>
            <br/>
            <input
              type="text"
              value={hoursLowerInput}
              style={{display: 'inline', maxWidth: '70px'}}
              onChange={(e) => setHoursLowerInput(+e.target.value)}
              onBlur={(e) => {
                if (isNaN(+e.target.value) || +e.target.value >= props.threshold.hours.upper || +e.target.value < threshold.hours.lower) {
                  setHoursLowerInput(props.threshold.hours.lower);
                  return;
                }
                props.onChangeThreshold({value: +e.target.value, threshold: 'hours-lower'})
              }}
            />
            <MultiRangeSlider
              style={{margin: '0 10px'}}
              min={threshold.hours.lower}
              max={threshold.hours.upper}
              minValue={props.threshold.hours.lower}
              maxValue={props.threshold.hours.upper}
              canMinMaxValueSame={true}
              label={false}
              ruler={false}
              onChange={e => {
                props.onChangeThreshold({value: e.minValue, threshold: 'hours-lower'});
                props.onChangeThreshold({value: e.maxValue, threshold: 'hours-upper'});
                setHoursLowerInput(e.minValue);
                setHoursUpperInput(e.maxValue);
              }}
            /><input
            type="text"
            value={hoursUpperInput}
            style={{display: 'inline', maxWidth: '70px'}}
            onChange={(e) => setHoursUpperInput(+e.target.value)}
            onBlur={(e) => {
              if (isNaN(+e.target.value) || +e.target.value <= props.threshold.hours.lower || +e.target.value > threshold.hours.upper) {
                setHoursUpperInput(props.threshold.hours.upper);
                return;
              }
              props.onChangeThreshold({value: +e.target.value, threshold: 'hours-upper'})
            }}
          />
          </div>

          <h2>Lines changed</h2>
          <div>
            <input
              type="text"
              value={changesLowerInput}
              style={{display: 'inline', maxWidth: '70px'}}
              onChange={(e) => setChangesLowerInput(+e.target.value)}
              onBlur={(e) => {
                if (isNaN(+e.target.value) || +e.target.value >= props.threshold.change.upper || +e.target.value < threshold.change.lower) {
                  setChangesLowerInput(props.threshold.change.lower);
                  return;
                }
                props.onChangeThreshold({value: +e.target.value, threshold: 'change-lower'})
              }}
            />
            <MultiRangeSlider
              style={{margin: '0 10px'}}
              min={threshold.change.lower}
              max={threshold.change.upper}
              minValue={props.threshold.change.lower}
              maxValue={props.threshold.change.upper}
              canMinMaxValueSame={true}
              label={false}
              ruler={false}
              onChange={e => {
                props.onChangeThreshold({value: e.minValue, threshold: 'change-lower'});
                props.onChangeThreshold({value: e.maxValue, threshold: 'change-upper'});
                setChangesLowerInput(e.minValue);
                setChangesUpperInput(e.maxValue);
              }}
            /><input
            type="text"
            value={changesUpperInput}
            style={{display: 'inline', maxWidth: '70px'}}
            onChange={(e) => setChangesUpperInput(+e.target.value)}
            onBlur={(e) => {
              if (isNaN(+e.target.value) || +e.target.value <= props.threshold.change.lower || +e.target.value > threshold.change.upper) {
                setChangesUpperInput(props.threshold.change.upper);
                return;
              }
              props.onChangeThreshold({value: +e.target.value, threshold: 'change-upper'})
            }}
          />
          </div>
          <h2>Ratio</h2>
          <div>
            <input
              type="text"
              value={ratioLowerInput}
              style={{display: 'inline', maxWidth: '70px'}}
              onChange={(e) => setRatioLowerInput(+e.target.value)}
              onBlur={(e) => {
                if (isNaN(+e.target.value) || +e.target.value >= props.threshold.ratio.upper || +e.target.value < threshold.ratio.lower) {
                  setRatioLowerInput(props.threshold.ratio.lower);
                  return;
                }
                props.onChangeThreshold({value: +e.target.value, threshold: 'ratio-lower'})
              }}
            />
            <MultiRangeSlider
              style={{margin: '0 10px'}}
              min={threshold.ratio.lower}
              max={threshold.ratio.upper}
              minValue={props.threshold.ratio.lower}
              maxValue={props.threshold.ratio.upper}
              canMinMaxValueSame={true}
              label={false}
              ruler={false}
              onChange={e => {
                props.onChangeThreshold({value: e.minValue, threshold: 'ratio-lower'});
                props.onChangeThreshold({value: e.maxValue, threshold: 'ratio-upper'});
                setRatioLowerInput(e.minValue);
                setRatioUpperInput(e.maxValue);
              }}
            /><input
            type="text"
            value={ratioUpperInput}
            style={{display: 'inline', maxWidth: '70px'}}
            onChange={(e) => setRatioUpperInput(+e.target.value)}
            onBlur={(e) => {
              if (isNaN(+e.target.value) || +e.target.value <= props.threshold.ratio.lower || +e.target.value > threshold.ratio.upper) {
                setRatioUpperInput(props.threshold.ratio.upper);
                return;
              }
              props.onChangeThreshold({value: +e.target.value, threshold: 'ratio-upper'})
            }}
          />
          </div>
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
          onChange={(selected) => props.onChangeCommitType(selected.map(s => s.value))}
          labelledBy={"Select commit type"}
        />

        <label className="label">Time estimation parameters</label>
        <h2>First commit time (in minutes):</h2>
        <input type="number" value={+props.firstCommitTime} onChange={(e) => props.onFirstCommitTime(+e.target.value)}/>
        <h2>Maximum session length (in minutes):</h2>
        <input type="number" value={+props.maxSessionLength} onChange={(e) => props.onMaxSessionLength(+e.target.value)}/>

        <label className="label">Search term</label>
        <textarea className={'textarea'} cols={50} rows={3}
                  onChange={(e) => props.onChangeSearchTerm(e.target.value)}>
        </textarea>
      </div>
    </div>
  );
};

const DashboardConfig = connect(mapStateToProps, mapDispatchToProps)(CommitTimeTrackingConfigComponent);

export default DashboardConfig;
