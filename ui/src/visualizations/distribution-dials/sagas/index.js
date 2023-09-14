import { createAction } from 'redux-actions';
import { select, throttle, fork, takeEvery } from 'redux-saga/effects';
import _ from 'lodash';

import { fetchFactory, timestampedActionFactory, mapSaga } from '../../../sagas/utils.js';
import { getBuilds, getCommits, getIssues } from './helper.js';

export const requestDistributionDialsData = createAction('REQUEST_DISTRIBUTION_DIALS_DATA');
export const receiveDistributionDialsData = timestampedActionFactory('RECEIVE_DISTRIBUTION_DIALS_DATA');
export const receiveDistributionDialsDataError = createAction('RECEIVE_DISTRIBUTION_DIALS_DATA_ERROR');
export const requestRefresh = createAction('REQUEST_REFRESH');
const refresh = createAction('REFRESH');

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

    console.time('fetch Distribution Dials Data');

    return yield Promise.all([getCommits(), getIssues(), getBuilds()])
      .then(([commits, issues, builds]) => {
        result.rawData.commits = commits;
        result.rawData.issues = issues;
        result.rawData.builds = builds;

        console.log(result);

        console.timeEnd('fetch Distribution Dials Data');

        return result;
      })
      .catch((e) => {
        console.log('Error in distribution dials saga: ', e);
        return {};
      });
  },
  requestDistributionDialsData,
  receiveDistributionDialsData,
  receiveDistributionDialsDataError
);
