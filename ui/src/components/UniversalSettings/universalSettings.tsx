'use strict';

import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styles from './styles.scss';
import {
  setResolution,
  setTimeSpan,
  setSelectedAuthors,
  setAllAuthors,
  setMergedAuthorList,
  setOtherAuthorList,
  setExcludeMergeCommits,
  setSprints,
} from '../../sagas';
import DateRangeFilter from '../DateRangeFilter/dateRangeFilter';
import AuthorMerger from './authorMerger/authorMerger';
import AuthorList from './authorList/authorList';
import SprintManager from './sprintManager/sprintManager';
import { IAuthor, ICommitter, IPalette } from '../../types/authorTypes';
import { IUniversalSettings, IUniversalSettingsConfig } from '../../types/unversalSettingsTypes';
import { IDateRange, IGlobalState } from '../../types/globalTypes';
import { ISprint } from '../../types/sprintTypes';

interface IProps {
  universalSettingsConfig: IUniversalSettingsConfig;
}

export default (props: IProps) => {
  //config
  const hideDateSettings = props.universalSettingsConfig.hideDateSettings === true;
  const hideGranularitySettings = props.universalSettingsConfig.hideGranularitySettings === true;
  const hideCommitSettings = props.universalSettingsConfig.hideCommitSettings === true;
  const hideSprintSettings = props.universalSettingsConfig.hideSprintSettings === true;

  //global state

  const universalSettings: IUniversalSettings = useSelector((state: IGlobalState) => state.universalSettings);
  const chartResolution = universalSettings.chartResolution;
  const firstCommit = universalSettings.universalSettingsData.data.firstCommit;
  const lastCommit = universalSettings.universalSettingsData.data.lastCommit;
  const committers = universalSettings.universalSettingsData.data.committers;
  const palette = universalSettings.universalSettingsData.data.palette;
  const firstSignificantTimestamp = universalSettings.universalSettingsData.data.firstSignificantTimestamp;
  const lastSignificantTimestamp = universalSettings.universalSettingsData.data.lastSignificantTimestamp;
  const excludeMergeCommits = universalSettings.excludeMergeCommits;
  const mergedAuthorListGlobal = universalSettings.mergedAuthors;
  const otherAuthorListGlobal = universalSettings.otherAuthors;

  let firstDisplayDate: string;
  let lastDisplayDate: string;
  let selectedAuthors: string[];
  let otherAuthorsGlobal: ICommitter[];
  let sprints: ISprint[] = [];

  if (universalSettings.chartTimeSpan.from === undefined) {
    firstDisplayDate = firstCommit !== undefined ? firstCommit.date.split('.')[0] : undefined;
  } else {
    firstDisplayDate = universalSettings.chartTimeSpan.from;
  }

  if (universalSettings.chartTimeSpan.to === undefined) {
    lastDisplayDate = lastCommit !== undefined ? lastCommit.date.split('.')[0] : undefined;
  } else {
    lastDisplayDate = universalSettings.chartTimeSpan.to;
  }

  if (universalSettings.selectedAuthorsGlobal !== undefined) {
    selectedAuthors = universalSettings.selectedAuthorsGlobal;
  }

  if (universalSettings.otherAuthors !== undefined) {
    otherAuthorsGlobal = universalSettings.otherAuthors;
  }
  if (universalSettings.sprints !== undefined) {
    sprints = universalSettings.sprints;
  }

  const dispatch = useDispatch();
  const onClickResolution = (resolution: string) => dispatch(setResolution(resolution));
  const onChangeTimeSpan = (timeSpan: IDateRange) => dispatch(setTimeSpan(timeSpan));
  const onAuthorSelectionChanged = (selectedAuthors: string[]) => dispatch(setSelectedAuthors(selectedAuthors));
  const onMergedAuthorListChanged = (mergedAuthorList: IAuthor[]) => dispatch(setMergedAuthorList(mergedAuthorList));
  const onOtherAuthorListChanged = (otherAuthorList: ICommitter[]) => dispatch(setOtherAuthorList(otherAuthorList));
  const onSetPalette = (allAuthors: IPalette) => dispatch(setAllAuthors(allAuthors));
  const onSetExcludeMergeCommits = (checked: boolean) => dispatch(setExcludeMergeCommits(checked));
  const onSetSprints = (sprints: ISprint[]) => dispatch(setSprints(sprints));

  //local state
  const [showAuthorMerge, setShowAuthorMerge] = React.useState(false);
  const [mergedAuthorList, setMergedAuthorListLocal] = React.useState([]);
  const [otherAuthors, setOtherAuthors] = React.useState([]);
  const [showSprintManager, setShowSprintManager] = React.useState(false);

  //set local state when global state changes
  React.useEffect(() => {
    setOtherAuthors(otherAuthorsGlobal);
  }, [otherAuthorsGlobal]);

  React.useEffect(() => {
    if (palette !== undefined) {
      onSetPalette(palette);
    }
  }, [palette]);

  //if the merged authors in the universal settings are not initialized yet
  // (either from local storage or because the app already started), do that now.
  //else just take the values from the global universal settings state
  React.useEffect(() => {
    if (committers && (mergedAuthorListGlobal === undefined || mergedAuthorListGlobal.length === 0)) {
      const mergedAuthorList = generateCommitterList(committers, palette);
      onMergedAuthorListChanged(mergedAuthorList);
      setMergedAuthorListLocal(mergedAuthorList);
      setOtherAuthors([]);
    } else {
      setMergedAuthorListLocal(mergedAuthorListGlobal);
      setOtherAuthorList(otherAuthorListGlobal);
    }
  }, [mergedAuthorListGlobal, otherAuthorListGlobal, committers]);

  const generateCommitterList = (committers: string[], palette: IPalette): IAuthor[] => {
    const committerList: IAuthor[] = [];
    for (const committer of committers) {
      committerList.push({
        mainCommitter: committer,
        committers: [{ signature: committer, color: palette[committer] }],
        color: palette[committer],
      });
    }
    return committerList;
  };

  const timestampToDateTimeString = (timestamp: number): string => {
    const date = new Date(timestamp);
    return (
      '' +
      date.getFullYear() +
      '-' +
      String(date.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(date.getDate()).padStart(2, '0') +
      'T' +
      String(date.getHours()).padStart(2, '0') +
      ':' +
      String(date.getMinutes()).padStart(2, '0') +
      ':' +
      String(date.getSeconds()).padStart(2, '0')
    );
  };

  return (
    <div className={styles.universalSettings}>
      {showAuthorMerge === true ? (
        <AuthorMerger
          committers={committers}
          palette={palette}
          mergedAuthorList={mergedAuthorList}
          selectedAuthors={selectedAuthors}
          other={otherAuthors}
          close={() => {
            setShowAuthorMerge(false);
          }}
          apply={(mergedAuthorList, otherAuthors, selectedAuthors) => {
            onMergedAuthorListChanged(mergedAuthorList);
            onOtherAuthorListChanged(otherAuthors);
            onAuthorSelectionChanged(selectedAuthors);
            setShowAuthorMerge(false);
            setMergedAuthorListLocal(mergedAuthorList);
            setOtherAuthors(otherAuthors);
          }}
        />
      ) : (
        ''
      )}
      {showSprintManager === true ? (
        <SprintManager
          sprints={sprints}
          close={() => {
            setShowSprintManager(false);
          }}
          setSprints={(sprints) => {
            onSetSprints(sprints);
          }}
        />
      ) : (
        ''
      )}
      {!hideGranularitySettings && (
        <>
          <h2>Granularity</h2>
          <div className="control">
            <div className="select">
              <select value={chartResolution} onChange={(e) => onClickResolution(e.target.value)}>
                <option value="years">Year</option>
                <option value="months">Month</option>
                <option value="weeks">Week</option>
                <option value="days">Day</option>
              </select>
            </div>
          </div>
        </>
      )}
      {!hideDateSettings && (
        <>
          <h2>Date Range</h2>
          <div>
            <DateRangeFilter
              from={firstDisplayDate}
              to={lastDisplayDate}
              onDateChanged={(data: IDateRange) => {
                onChangeTimeSpan(data);
              }}
            />
          </div>
          <div className={styles.marginTop05}>
            <button
              className="button"
              onClick={() => {
                const defaultTimeSpan = {
                  from: timestampToDateTimeString(firstSignificantTimestamp),
                  to: timestampToDateTimeString(lastSignificantTimestamp),
                };
                onChangeTimeSpan(defaultTimeSpan);
              }}>
              Reset
            </button>
          </div>
        </>
      )}
      <h2>Authors</h2>
      <div>
        <AuthorList
          palette={palette}
          authorList={mergedAuthorList}
          otherAuthors={otherAuthors}
          selectedAuthors={selectedAuthors}
          selectionChanged={(newSelection) => {
            onAuthorSelectionChanged(newSelection);
          }}></AuthorList>
      </div>
      <div className={styles.marginTop05}></div>
      <button
        className={'button'}
        onClick={() => {
          setShowAuthorMerge(true);
        }}>
        Merge duplicate Authors
      </button>
      {!hideCommitSettings && (
        <>
          <h2>Commits</h2>
          <div className="field">
            <input
              id="aggregateTimeSwitch"
              type="checkbox"
              name="aggregateTimeSwitch"
              className={'switch is-rounded is-outlined is-info'}
              defaultChecked={excludeMergeCommits}
              onChange={(e) => onSetExcludeMergeCommits(e.target.checked)}
            />
            <label htmlFor="aggregateTimeSwitch" className={styles.switch}>
              Exclude Merge Commits
            </label>
          </div>
        </>
      )}
      {!hideSprintSettings && (
        <>
          <h2>Sprints</h2>
          <button
            className={'button'}
            onClick={() => {
              setShowSprintManager(true);
            }}>
            Manage Sprints
          </button>
        </>
      )}
    </div>
  );
};
