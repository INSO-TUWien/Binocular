'use strict';

import { createAction } from 'redux-actions';
import { takeEvery, fork } from 'redux-saga/effects';
import _ from 'lodash';
import getCommitFiles from './getCommitFiles';

import { fetchFactory, timestampedActionFactory, mapSaga } from '../../../../sagas/utils.js';
import getCommitsModules from './getCommitsModules';
import getModuleData from './getModuleData';
import getBounds from './getBounds';

export const setNavigationMode = createAction('SET_NAVIGATION_MODE');
export const setTimeSpan = createAction('SET_TIME_SPAN');
export const applyTimeSpan = createAction('APPLY_TIME_SPAN')

export const requestData = createAction('REQUEST_DATA');
export const receiveData = timestampedActionFactory('RECEIVE_DATA');
export const receiveDataError = createAction('RECEIVE_DATA_ERROR');

export default function*() {
  yield testFunction();
  yield* fetchChangesData();
  yield fork(watchNavigationChange);
}

export function* watchNavigationChange() {
  yield takeEvery('SET_NAVIGATION_MODE', testFunction);
  yield takeEvery('APPLY_TIME_SPAN', () => {console.log("applied!")});
}

export const testFunction = 
  function*() {
    console.log("Saga worked!");
  };

  
export const fetchChangesData = fetchFactory(
  function* () {
    const {firstCommit, lastCommit} = yield getBounds();
    const firstCommitTimestamp = Date.parse(firstCommit.date);
    const lastCommitTimestamp = Date.parse(lastCommit.date);

    const {commitsModules} = yield getCommitsModules();
    const {commitsFiles} = yield getCommitFiles(firstCommitTimestamp, lastCommitTimestamp);
    const {moduleData} = yield getModuleData();
    

    return {commitsFiles, commitsModules, moduleData, firstCommit, lastCommit};
  },
  requestData,
  receiveData,
  receiveDataError
);