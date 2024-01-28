import { fetchFactory, timestampedActionFactory } from './utils';
import Database from '../database/database';
import { getChartColors } from '../utils';
import { createAction } from 'redux-actions';
import { Palette } from '../types/authorTypes';
export const requestUniversalSettingsData = createAction('REQUEST_UNIVERSAL_SETTINGS_DATA');
export const receiveUniversalSettingsData = timestampedActionFactory('RECEIVE_UNIVERSAL_SETTINGS_DATA');
export const receiveUniversalSettingsDataError = createAction('RECEIVE_UNIVERSAL_SETTINGS_DATA_ERROR');
export const fetchUniversalSettingsData = fetchFactory(
  function* () {
    const { firstCommit, lastCommit, committers, firstIssue, lastIssue } = yield Database.getBounds();
    const firstCommitTimestamp: number = Date.parse(firstCommit.date);
    const lastCommitTimestamp: number = Date.parse(lastCommit.date);

    const firstIssueTimestamp: number = firstIssue ? Date.parse(firstIssue.createdAt) : firstCommitTimestamp;
    const lastIssueTimestamp: number = lastIssue ? Date.parse(lastIssue.createdAt) : lastCommitTimestamp;

    const firstSignificantTimestamp: number = Math.min(firstCommitTimestamp, firstIssueTimestamp);
    const lastSignificantTimestamp: number = Math.max(lastCommitTimestamp, lastIssueTimestamp);

    const palette = getChartColors('spectral', [...committers, 'other']) as Palette;
    return {
      firstCommit,
      lastCommit,
      firstIssue,
      lastIssue,
      committers,
      palette,
      firstSignificantTimestamp,
      lastSignificantTimestamp,
    };
  },
  requestUniversalSettingsData,
  receiveUniversalSettingsData,
  receiveUniversalSettingsDataError,
);
