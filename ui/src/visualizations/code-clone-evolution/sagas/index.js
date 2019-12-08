'use strict';

import { createAction } from 'redux-actions';
import { select, takeEvery, fork } from 'redux-saga/effects';

import { fetchFactory, timestampedActionFactory } from '../../../sagas/utils.js';
import { graphQl } from '../../../utils';

export const setClone = createAction('SET_CLONE', c => c);
export const setStartRevision = createAction('SET_START_REV', s => s);
export const setEndRevision = createAction('SET_END_REV', e => e);
export const setPackage = createAction('SET_PACKAGE', p => p);
export const setCloneType = createAction('SET_CLONE_TYPE', t => t);

export const requestCodeCloneData = createAction('REQUEST_CODE_CLONE_DATA');
export const receiveCodeCloneData = timestampedActionFactory('RECEIVE_CODE_CLONE_DATA');
export const receiveCodeCloneDataError = createAction('RECEIVE_CODE_CLONE_DATA_ERROR');

export default function*() {
  yield fork(watchSetClone);
  yield fork(watchSetStartRevision);
  yield fork(watchSetEndRevision);
  yield fork(watchSetPackage);
  yield fork(watchSetCloneType);
}

export function* watchSetClone() {
  yield takeEvery('SET_CLONE', fetchCloneData);
}

export function* watchSetStartRevision() {
  yield takeEvery('SET_START_REV', fetchCloneData);
}

export function* watchSetEndRevision() {
  yield takeEvery('SET_END_REV', fetchCloneData);
}

export function* watchSetPackage() {
  yield takeEvery('SET_PACKAGE', fetchCloneData);
}

export function* watchSetCloneType() {
  yield takeEvery('SET_CLONE_TYPE', fetchCloneData);
}

export const fetchCloneData = fetchFactory(
  function*() {
    const state = yield select();
    const activeClone = state.visualizations.codeCloneEvolution.state.config.clone;

    if (activeClone === null) {
      return { clone: null };
    }

    return yield graphQl
      .query(
        `query($cid: String!) {
           clone(fingerprint: $cid) {
             fingerprint
             type
             sourcecode
             }
         }`,
        { cid: activeClone }
      )
      .then(resp => {
        return resp;
      });
  },
  requestCodeCloneData,
  receiveCodeCloneData,
  receiveCodeCloneDataError
);
