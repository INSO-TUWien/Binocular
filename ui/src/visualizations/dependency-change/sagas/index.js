'use strict';

import { createAction } from 'redux-actions';
import { select, takeEvery, fork } from 'redux-saga/effects';

import { fetchFactory, timestampedActionFactory } from '../../../sagas/utils.js';

export const setActiveFile = createAction('SET_ACTIVE_FILE', f => f);
export const setActivePath = createAction('SET_ACTIVE_PATH', p => p);
export const setActiveBranch = createAction('SET_ACTIVE_BRANCH', b => b);
export const setActiveCompareBranch = createAction('SET_ACTIVE_COMPARE_BRANCH', b => b);
export const setActiveFiles = createAction('SET_ACTIVE_FILES', f => f);
export const setActiveBranches = createAction('SET_ACTIVE_BRANCHES', b => b);

export const requestDependencyChangesData = createAction('REQUEST_DEPENDENCY_CHANGES_DATA');
export const receiveDependencyChangesData = timestampedActionFactory('RECEIVE_DEPENDENCY_CHANGES_DATA');
export const receiveDependencyChangesDataError = createAction('RECEIVE_DEPENDENCY_CHANGES_DATA_ERROR');

export default function*() {
  yield fork(watchSetActiveFile);
}

export function* watchSetActiveFile() {
  yield takeEvery('SET_ACTIVE_FILE', fetchFileUrl);
  yield takeEvery('SET_ACTIVE_BRANCH', fetchFileUrl);
  yield takeEvery('SET_ACTIVE_COMPARE_BRANCH', fetchFileUrl)
  yield takeEvery('SET_ACTIVE_PATH', fetchFileUrl);
  yield takeEvery('SET_ACTIVE_FILES', fetchFileUrl);
  yield takeEvery('SET_ACTIVE_BRANCHES', fetchFileUrl);
}

export const fetchFileUrl = fetchFactory(
  function*() {
    const state = yield select();
    const fileURL = state.visualizations.dependencyChanges.state.config.fileURL;
    const branch = state.visualizations.dependencyChanges.state.config.branch;
    const compareBranch = state.visualizations.dependencyChanges.state.config.compareBranch;
    const path = state.visualizations.dependencyChanges.state.config.path;
    const files = state.visualizations.dependencyChanges.state.config.files;
    const branches = state.visualizations.dependencyChanges.state.config.branches;

    return { fileURL, branch, compareBranch, files, path, branches };
  },
  requestDependencyChangesData,
  receiveDependencyChangesData,
  receiveDependencyChangesDataError
);
