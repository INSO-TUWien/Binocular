'use strict';

import { createAction } from 'redux-actions';
import { select, takeEvery, fork, throttle } from 'redux-saga/effects';
import _ from 'lodash';
import moment from 'moment';
import Promise from 'bluebird';
import getCommitFiles from './getCommitFiles';

import { fetchFactory, timestampedActionFactory, mapSaga } from '../../../../sagas/utils.js';
import { graphQl } from '../../../../utils';

export const setNavigationMode = createAction('SET_NAVIGATION_MODE');

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
}

export const testFunction = 
  function*() {
    console.log("Saga worked!");
  };

  
export const fetchChangesData = fetchFactory(
  function* () {
    const {commitsFiles} = yield getCommitFiles();
    return {commitsFiles};
  },
  requestData,
  receiveData,
  receiveDataError
);