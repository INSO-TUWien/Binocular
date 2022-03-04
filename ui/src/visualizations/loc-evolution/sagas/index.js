'use strict';

import Promise from 'bluebird';
import { createAction } from 'redux-actions';
import { select, throttle, fork, takeEvery } from 'redux-saga/effects';
import _ from 'lodash';
import moment from 'moment';

import { fetchFactory, timestampedActionFactory, mapSaga } from '../../../sagas/utils.js';

export const setCommitAttribute = createAction('SET_COMMIT_ATTRIBUTE');
export const setActiveFolder = createAction('SET_HIGHLIGHTED_FOLDER');
export const setFilteredFiles = createAction('SET_FILTERED_FILES', fs => fs);

export const requestRefresh = createAction('REQUEST_REFRESH');
const refresh = createAction('REFRESH');

export default function*() {
  // fetch data once on entry
  setActiveFolder
}