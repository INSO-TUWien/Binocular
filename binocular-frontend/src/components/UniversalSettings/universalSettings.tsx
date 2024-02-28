'use strict';

import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styles from './styles.module.scss';
import {
  setResolution,
  setTimeSpan,
  setSelectedAuthors,
  setAllAuthors,
  setMergedAuthorList,
  setOtherAuthorList,
  setExcludeMergeCommits,
  setSprints,
  setExcludeCommits,
  setExcludedCommits,
} from '../../sagas';
import DateRangeFilter from '../DateRangeFilter/dateRangeFilter';
import AuthorMerger from './authorMerger/authorMerger';
import AuthorList from './authorList/authorList';
import SprintManager from './sprintManager/sprintManager';
import ExcludeCommitsComponent from './excludeCommitsComponent/ExcludeCommitsComponent';
import { Author, Committer, Palette } from '../../types/authorTypes';
import { UniversalSettings, UniversalSettingsConfig } from '../../types/unversalSettingsTypes';
import { DateRange, GlobalState } from '../../types/globalTypes';
import { Sprint } from '../../types/sprintTypes';

interface Props {
  universalSettingsConfig: UniversalSettingsConfig;
}

export default (props: Props) => {
  //config
  const hideDateSettings = props.universalSettingsConfig.hideDateSettings;
  const hideGranularitySettings = props.universalSettingsConfig.hideGranularitySettings;
  const hideMergeCommitSettings = props.universalSettingsConfig.hideMergeCommitSettings;
  const hideExcludeCommitSettings = props.universalSettingsConfig.hideExcludeCommitSettings;
  const hideSprintSettings = props.universalSettingsConfig.hideSprintSettings;

  //global state

  const universalSettings: UniversalSettings = useSelector((state: GlobalState) => state.universalSettings);
  const chartResolution = universalSettings.chartResolution;
  const firstCommit = universalSettings.universalSettingsData?.data.firstCommit;
  const lastCommit = universalSettings.universalSettingsData?.data.lastCommit;
  const committers = universalSettings.universalSettingsData?.data.committers;
  const palette = universalSettings.universalSettingsData?.data.palette;
  const firstSignificantTimestamp = universalSettings.universalSettingsData?.data.firstSignificantTimestamp;
  const lastSignificantTimestamp = universalSettings.universalSettingsData?.data.lastSignificantTimestamp;
  const excludeMergeCommits = universalSettings.excludeMergeCommits;
  const excludeCommits = universalSettings.excludeCommits;
  const excludedCommits = universalSettings.excludedCommits;
  const mergedAuthorListGlobal = universalSettings.mergedAuthors;
  const otherAuthorListGlobal = universalSettings.otherAuthors;

  let firstDisplayDate: string | undefined;
  let lastDisplayDate: string | undefined;
  let selectedAuthors: string[] = [];
  let otherAuthorsGlobal: Committer[] = [];
  let sprints: Sprint[] = [];

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
  const onChangeTimeSpan = (timeSpan: DateRange) => dispatch(setTimeSpan(timeSpan));
  const onAuthorSelectionChanged = (selectedAuthors: string[]) => dispatch(setSelectedAuthors(selectedAuthors));
  const onMergedAuthorListChanged = (mergedAuthorList: Author[]) => dispatch(setMergedAuthorList(mergedAuthorList));
  const onOtherAuthorListChanged = (otherAuthorList: Committer[]) => dispatch(setOtherAuthorList(otherAuthorList));
  const onSetPalette = (allAuthors: Palette) => dispatch(setAllAuthors(allAuthors));
  const onSetExcludeMergeCommits = (checked: boolean) => dispatch(setExcludeMergeCommits(checked));
  const onSetExcludeCommits = (checked: boolean) => dispatch(setExcludeCommits(checked));
  const onSetExcludedCommits = (commitsToExclude: string[]) => dispatch(setExcludedCommits(commitsToExclude));
  const onSetSprints = (sprints: Sprint[]) => dispatch(setSprints(sprints));

  //local state
  const [showAuthorMerge, setShowAuthorMerge] = React.useState(false);
  const [mergedAuthorList, setMergedAuthorListLocal] = React.useState<Author[]>([]);
  const [otherAuthors, setOtherAuthors] = React.useState<Committer[]>([]);
  const [showSprintManager, setShowSprintManager] = React.useState(false);

  //set local state when global state changes
  React.useEffect(() => {
    setOtherAuthors(otherAuthorsGlobal);
    return;
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

  const generateCommitterList = (committers: string[], palette: Palette | undefined): Author[] => {
    if (!palette) {
      return [];
    }
    const committerList: Author[] = [];
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

  const checkTimeSpan = (timeSpan: DateRange): DateRange => {
    timeSpan.from = timeSpan.from === '' ? undefined : timeSpan.from;
    timeSpan.to = timeSpan.to === '' ? undefined : timeSpan.to;
    return timeSpan;
  };

  if (!committers || !palette) {
    return <div></div>;
  }

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
              onDateChanged={(data: DateRange) => onChangeTimeSpan(checkTimeSpan(data))}
            />
          </div>
          <div className={styles.marginTop05}>
            <button
              className="button"
              onClick={() => {
                if (!firstSignificantTimestamp || !lastSignificantTimestamp) {
                  return;
                }
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
      {(!hideMergeCommitSettings || !hideExcludeCommitSettings) && (
        <>
          <h2>Commits</h2>
          {!hideMergeCommitSettings && (
            <div className="field">
              <input
                id="excludeMergeCommitsSwitch"
                type="checkbox"
                name="excludeMergeCommitsSwitch"
                className={'switch is-rounded is-outlined is-info'}
                defaultChecked={excludeMergeCommits}
                onChange={(e) => onSetExcludeMergeCommits(e.target.checked)}
              />
              <label htmlFor="excludeMergeCommitsSwitch" className={styles.switch}>
                Exclude Merge Commits
              </label>
            </div>
          )}
          {!hideExcludeCommitSettings && (
            <>
              <input
                id="excludeCommitsSwitch"
                type="checkbox"
                name="excludeCommitsSwitch"
                className={'switch is-rounded is-outlined is-info'}
                defaultChecked={excludeCommits}
                onChange={(e) => onSetExcludeCommits(e.target.checked)}
              />
              <label htmlFor="excludeCommitsSwitch" className={styles.switch}>
                Exclude Specific Commits
              </label>

              {excludeCommits && excludedCommits !== undefined && (
                <ExcludeCommitsComponent
                  excludedCommits={excludedCommits}
                  setGlobalExcludeCommits={onSetExcludedCommits}></ExcludeCommitsComponent>
              )}
            </>
          )}
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
