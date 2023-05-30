import { fetchFactory, timestampedActionFactory } from './utils';
import Database from '../database/database';
import { getChartColors } from '../utils';
import { createAction } from 'redux-actions';
export const requestUniversalSettingsData = createAction('REQUEST_UNIVERSAL_SETTINGS_DATA');
export const receiveUniversalSettingsData = timestampedActionFactory('RECEIVE_UNIVERSAL_SETTINGS_DATA');
export const receiveUniversalSettingsDataError = createAction('RECEIVE_UNIVERSAL_SETTINGS_DATA_ERROR');
export const fetchUniversalSettingsData = fetchFactory(
  function* () {
    const { firstCommit, lastCommit, committers, firstIssue, lastIssue } = yield Database.getBounds();
    const firstCommitTimestamp = Date.parse(firstCommit.date);
    const lastCommitTimestamp = Date.parse(lastCommit.date);

    const firstIssueTimestamp = firstIssue ? Date.parse(firstIssue.createdAt) : firstCommitTimestamp;
    const lastIssueTimestamp = lastIssue ? Date.parse(lastIssue.createdAt) : lastCommitTimestamp;

    const firstSignificantTimestamp = Math.min(firstCommitTimestamp, firstIssueTimestamp);
    const lastSignificantTimestamp = Math.max(lastCommitTimestamp, lastIssueTimestamp);

    return yield Promise.all([
      Database.getCommitData([firstCommitTimestamp, lastCommitTimestamp], [firstSignificantTimestamp, lastSignificantTimestamp]),
    ])
      .then((results) => {
        const commits = results[0];
        const palette = getChartColors('spectral', [...committers, 'other']);
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
      })
      .catch(function (e) {
        console.error(e.stack);
        throw e;
      });
  },
  requestUniversalSettingsData,
  receiveUniversalSettingsData,
  receiveUniversalSettingsDataError
);
