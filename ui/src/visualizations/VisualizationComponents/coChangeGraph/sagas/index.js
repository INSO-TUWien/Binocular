'use strict';

import { createAction } from 'redux-actions';
import { takeEvery, fork, select } from 'redux-saga/effects';
import _ from 'lodash';
import getCommitFiles from './getCommitFiles';

import { fetchFactory, timestampedActionFactory, mapSaga } from '../../../../sagas/utils.js';
import getCommitsModules from './getCommitsModules';
import getModuleData from './getModuleData';
import getBounds from './getBounds';

export const setTimeSpan = createAction('SET_TIME_SPAN');
export const setEntitySelection = createAction('SET_ENTITY_SELECTION')
export const setFilterContent = createAction('SET_PATH_FILTER');
export const applyTimeSpan = createAction('APPLY_TIME_SPAN')
export const setShowIntraModuleDeps = createAction('SET_SHOW_INTRA_MODULE_DEPS')

export const requestData = createAction('REQUEST_DATA');
export const receiveData = timestampedActionFactory('RECEIVE_DATA');
export const receiveDataError = createAction('RECEIVE_DATA_ERROR');

export default function*() {
  //yield* fetchChangesData();
  yield fork(watchNavigationChange);
}

export function* watchNavigationChange() {
  yield takeEvery('APPLY_TIME_SPAN', fetchChangesData);
}
  
export const fetchChangesData = fetchFactory(
  function* (event) {
    const {firstCommit, lastCommit} = yield getBounds();
    let firstCommitTimestamp = Date.parse(firstCommit.date);
    let lastCommitTimestamp = Date.parse(lastCommit.date);

    const state = yield select();
    const timeSpan = state.visualizations.coChangeGraph.state.config.chartTimeSpan;

    // filtering options
    const pathFilter = event.payload.filter;
    const lowerBounds = event.payload.lowerBounds;
    const entitySelection = event.payload.entitySelection;

    firstCommitTimestamp = timeSpan.from === undefined ? firstCommitTimestamp : new Date(timeSpan.from).getTime();
    lastCommitTimestamp = timeSpan.to === undefined ? lastCommitTimestamp : new Date(timeSpan.to).getTime();

    console.log(firstCommitTimestamp);
    console.log(lastCommitTimestamp);

    const {commitsModules} = yield getCommitsModules();
    const {commitsFiles} = yield getCommitFiles(firstCommitTimestamp, lastCommitTimestamp);
    const {moduleData} = yield getModuleData();
    

    return {commitsFiles, commitsModules, moduleData, firstCommit, lastCommit, pathFilter, lowerBounds, entitySelection};
  },
  requestData,
  receiveData,
  receiveDataError
);