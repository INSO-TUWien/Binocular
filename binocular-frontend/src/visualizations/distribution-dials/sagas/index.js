import { createAction } from 'redux-actions';
import { throttle, fork, takeEvery } from 'redux-saga/effects';
import _ from 'lodash';

import { fetchFactory, timestampedActionFactory, mapSaga } from '../../../sagas/utils.ts';
import { getBuilds, getCommits, getIssues } from './helper';

export const requestDistributionDialsData = createAction('DD_REQUEST_DISTRIBUTION_DIALS_DATA');
export const receiveDistributionDialsData = timestampedActionFactory('DD_RECEIVE_DISTRIBUTION_DIALS_DATA');
export const receiveDistributionDialsDataError = createAction('DD_RECEIVE_DISTRIBUTION_DIALS_DATA_ERROR');
export const requestRefresh = createAction('DD_REQUEST_REFRESH');
const refresh = createAction('DD_REFRESH');

export const setLayers = createAction('DD_SET_LAYERS', (s) => s);
export const setSplitLayers = createAction('DD_SET_SPLIT_LAYERS', (s) => s);
export const setSelectLayers = createAction('DD_SET_SELECT_LAYERS', (s) => s);
export const setFilterCommitsChanges = createAction('DD_SET_FILTER_COMMITS_CHANGES', (s) => s);
export const setFilterCommitsChangesCutoff = createAction('DD_SET_FILTER_COMMITS_CHANGES_CUTOFF', (s) => s);
export const setColorSegments = createAction('DD_SET_COLOR_SEGMENTS', (s) => s);

export default function* () {
  yield fetchDistributionDialsData();
  yield fork(watchRefreshRequests);
  yield fork(watchRefresh);
}

function* watchRefreshRequests() {
  yield throttle(2000, 'REQUEST_REFRESH', mapSaga(refresh));
}

function* watchRefresh() {
  yield takeEvery('REFRESH', fetchDistributionDialsData);
}

export const fetchDistributionDialsData = fetchFactory(
  function* () {
    const result = {
      rawData: {
        commits: [],
        issues: [],
        builds: [],
      },
    };

    return yield Promise.all([getCommits(), getIssues(), getBuilds()])
      .then(([commits, issues, builds]) => {
        result.rawData.commits = commits;
        result.rawData.issues = issues;
        result.rawData.builds = builds;

        return result;
      })
      .catch((e) => {
        console.log('Error in distribution dials saga: ', e);
        return {};
      });
  },
  requestDistributionDialsData,
  receiveDistributionDialsData,
  receiveDistributionDialsDataError,
);
