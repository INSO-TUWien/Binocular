'use strict';

import React, { useState, useEffect } from 'react';
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
} from '../../sagas';
import DateRangeFilter from '../DateRangeFilter/dateRangeFilter';
import AuthorMerger from './authorMerger/authorMerger';
import AuthorList from './authorList/authorList';

export default ({ universalSettingsConfig }) => {
  //config
  const hideDateSettings = universalSettingsConfig.hideDateSettings === true;
  const hideGranularitySettings = universalSettingsConfig.hideGranularitySettings === true;
  const hideCommitSettings = universalSettingsConfig.hideCommitSettings === true;

  //global state
  const universalSettings = useSelector((state) => state.universalSettings);
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

  let firstDisplayDate;
  let lastDisplayDate;
  let selectedAuthors;
  let otherAuthorsGlobal;

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

  const dispatch = useDispatch();
  const onClickResolution = (resolution) => dispatch(setResolution(resolution));
  const onChangeTimeSpan = (timeSpan) => dispatch(setTimeSpan(timeSpan));
  const onAuthorSelectionChanged = (selected) => dispatch(setSelectedAuthors(selected));
  const onMergedAuthorListChanged = (selected) => dispatch(setMergedAuthorList(selected));
  const onOtherAuthorListChanged = (selected) => dispatch(setOtherAuthorList(selected));
  const onSetPalette = (allAuthors) => dispatch(setAllAuthors(allAuthors));
  const onSetExcludeMergeCommits = (checked) => dispatch(setExcludeMergeCommits(checked));

  //local state
  const [showAuthorMerge, setShowAuthorMerge] = useState(false);
  const [mergedAuthorList, setMergedAuthorListLocal] = useState([]);
  const [otherAuthors, setOtherAuthors] = useState([]);

  //set local state when global state changes
  useEffect(() => {
    setOtherAuthors(otherAuthorsGlobal);
  }, [otherAuthorsGlobal]);

  useEffect(() => {
    if (palette !== undefined) {
      onSetPalette(palette);
    }
  }, [palette]);

  //if the merged authors in the universal settings are not initialized yet
  // (either from local storage or because the app already started), do that now.
  //else just take the values from the global universal settings state
  useEffect(() => {
    if (committers && (mergedAuthorListGlobal === undefined || mergedAuthorListGlobal.length === 0)) {
      const mergedAuthorList = generateCommittersList(committers, palette);
      onMergedAuthorListChanged(mergedAuthorList);
      setMergedAuthorListLocal(mergedAuthorList);
      setOtherAuthors([]);
    } else {
      setMergedAuthorListLocal(mergedAuthorListGlobal);
      setOtherAuthorList(otherAuthorListGlobal);
    }
  }, [mergedAuthorListGlobal, otherAuthorListGlobal, committers]);

  const generateCommittersList = (committers, palette) => {
    const committersList = [];
    for (const committer of committers) {
      committersList.push({
        mainCommitter: committer,
        committers: [{ signature: committer, color: palette[committer] }],
        color: palette[committer],
      });
    }
    return committersList;
  };

  const timestampToDateTimeString = (timestamp) => {
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
              onDateChanged={(data) => {
                onChangeTimeSpan(data);
              }}
            />
          </div>
          <div className={styles.marginTop05}>
            <button
              className="button"
              onClick={(e) => {
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
    </div>
  );
};
