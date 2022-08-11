'use strict';

import { createAction } from 'redux-actions';
import { select, takeEvery, fork, throttle } from 'redux-saga/effects';
import _ from 'lodash';
import moment from 'moment';
import Promise from 'bluebird';

import { fetchFactory, timestampedActionFactory, mapSaga } from '../../../../sagas/utils.js';
import { graphQl } from '../../../../utils';

export const setNavigationMode = createAction('SET_NAVIGATION_MODE');

export default function*() {
  yield testFunction();
  yield fork(watchNavigationChange);
}

export function* watchNavigationChange() {
  yield takeEvery('SET_NAVIGATION_MODE', testFunction);
}

export const testFunction = 
  function*() {
    console.log("Saga worked!");
  };
