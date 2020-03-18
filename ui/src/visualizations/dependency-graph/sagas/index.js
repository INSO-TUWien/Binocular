'use strict';

import Promise from 'bluebird';
import { createAction } from 'redux-actions';
import { select, takeEvery, fork, throttle } from 'redux-saga/effects';
import _ from 'lodash';

import { fetchFactory, timestampedActionFactory, mapSaga } from '../../../sagas/utils.js';
import getGraphData from './getGraphData.js';

export const setDepth = createAction('SET_DEPTH');
export const setMeanPercentageOfCombinedCommitsThreshold = createAction('SET_COMBINED_THRESHHOLD');
export const setMeanPercentageOfMaxCommitsThreshold = createAction('SET_MAX_THRESHHOLD');
export const setFiles = createAction('SET_FILES');
export const reloadData = createAction('RELOAD_DATA');

export const requestDependencyGraphData = createAction('REQUEST_DEPENDENCY_GRAPH_DATA');
export const receiveDependencyGraphData = timestampedActionFactory('RECEIVE_DEPENDENCY_GRAPH_DATA');
export const receiveDependencyGraphDataError = createAction('RECEIVE_DEPENDENCY_GRAPH_DATA_ERROR');

export default function*() {
  yield fetchDependencyGraphData();
  yield fork(watchReloadData);
  yield fork(watchSetDepth);
  yield fork(watchSetMeanPercentageOfCombinedCommitsThreshold);
  yield fork(watchSetMeanPercentageOfMaxCommitsThreshold);
}

export function* watchReloadData() {
  yield takeEvery('RELOAD_DATA', fetchDependencyGraphData);
}

export function* watchSetDepth() {
  yield takeEvery('SET_DEPTH', fetchDependencyGraphData);
}

export function* watchSetMeanPercentageOfCombinedCommitsThreshold() {
  yield takeEvery('SET_COMBINED_THRESHHOLD', fetchDependencyGraphData);
}

export function* watchSetMeanPercentageOfMaxCommitsThreshold() {
  yield takeEvery('SET_MAX_THRESHHOLD', fetchDependencyGraphData);
}

export const fetchDependencyGraphData = fetchFactory(
  function*() {
    const state = yield select();
    const config = state.visualizations.dependencyGraph.state.config;

    return yield Promise.join(
      getGraphData(config)
    )
      .spread((filesAndLinks) => {
        return {
          filesAndLinks: filesAndLinks
        };
      })
      .catch(function(e) {
        console.error(e.stack);
        throw e;
      });
  },
  requestDependencyGraphData,
  receiveDependencyGraphData,
  receiveDependencyGraphDataError
);
