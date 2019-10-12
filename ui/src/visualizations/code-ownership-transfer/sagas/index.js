'use strict';

import Promise from 'bluebird';
import {createAction} from 'redux-actions';
import {throttle, fork, takeEvery, select} from 'redux-saga/effects';


import {fetchFactory, timestampedActionFactory, mapSaga} from '../../../sagas/utils.js';

import fetchRelatedCommits from './fetchRelatedCommits.js';

import getDevelopers from "./getDevelopers";
import getFiles, {fileList} from "./getAllFiles";
import getOwnershipList from "./getOwner"
import getFilesForDeveloper from "./getFilesForDeveloper";


export const setCategory = createAction('SET_CATEGORY');
export const setActiveFile = createAction('SET_ACTIVE_FILE');


export const setOverlay = createAction('SET_OVERLAY');
export const setCommitAttribute = createAction('SET_COMMIT_ATTRIBUTE');

export const requestCodeOwnershipData = createAction('REQUEST_CODE_OWNERSHIP_TRANSFER_DATA');
export const receiveCodeOwnershipData = timestampedActionFactory('RECEIVE_CODE_OWNERSHIP_TRANSFER_DATA');
export const receiveCodeOwnershipDataError = createAction('RECEIVE_CODE_OWNERSHIP_TRANSFER_DATA_ERROR');

export const requestRefresh = createAction('REQUEST_REFRESH');
const refresh = createAction('REFRESH');
export const setViewport = createAction('COR_SET_VIEWPORT');
export var selectedFile = '';

export default function* () {
  // fetch data once on entry
  yield* fetchCodeOwnershipData();

  yield fork(watchRefreshRequests);
  yield fork(watchMessages);


  // keep looking for viewport changes to re-fetch
  yield fork(watchSetActiveFile);
  yield fork(watchViewport);
  yield fork(watchSetCategory);
  yield fork(watchRefresh);
  yield fork(watchHighlightedIssue);
  yield fork(watchToggleHelp);
  yield fork(watchSetOverlay);
}

export function* watchSetActiveFile() {
  yield takeEvery('SET_ACTIVE_FILE', function*(a) {
    return yield fetchCodeOwnershipData(a.payload);
  });
}

function* watchRefreshRequests() {
  yield throttle(2000, 'REQUEST_REFRESH', mapSaga(refresh));
}

export function* watchSetCategory() {
  yield takeEvery('SET_CATEGORY', fetchCodeOwnershipData);
}

function* watchMessages() {
  yield takeEvery('message', mapSaga(requestRefresh));
}


function* watchViewport() {
  yield takeEvery('COR_SET_VIEWPORT', mapSaga(requestRefresh));
}

function* watchToggleHelp() {
  yield takeEvery('TOGGLE_HELP', mapSaga(refresh));
}

function* watchSetOverlay() {
  yield takeEvery('SET_OVERLAY', fetchCodeOwnershipData);
}

function* watchRefresh() {
  yield takeEvery('REFRESH', fetchCodeOwnershipData);
}

function* watchHighlightedIssue() {
  yield takeEvery('SET_HIGHLIGHTED_ISSUE', function* (a) {
    return yield fetchRelatedCommits(a.payload);
  });
}

export const fetchCodeOwnershipData = fetchFactory(
  function* () {
    const state = yield select();

    const activeFile = state.visualizations.codeOwnershipTransfer.state.config.chosenFile;
    const developer = state.visualizations.codeOwnershipTransfer.state.config.category;

    console.log('Chosen Developer', developer);
    console.log('Active file:', activeFile);


    if (!activeFile) {
      selectedFile = null;
    }

    if (activeFile === null) {
      return {chosenFile: null}
    }

    //sort commits by date for selected file
    if(activeFile !== '') {
      for (let i = 0; i < fileList.length; i++) {
        if(fileList[i].path === activeFile.path ) {
          fileList[i].commits.sort(function(a,b) {
              return new Date(a.date) - new Date(b.date);
            });
          //function to get ownership of the file
          selectedFile = fileList[i];
          getOwnershipList(fileList[i]);
        } else if (fileList[i].path === activeFile.label) {
          fileList[i].commits.sort(function(a,b) {
            return new Date(a.date) - new Date(b.date);
          });
          //function to get ownership of the file
          selectedFile = fileList[i];
          getOwnershipList(fileList[i]);
        }
      }
    }

    if(developer) {
      getFilesForDeveloper(developer);
    }

    return yield Promise.join(
      getDevelopers(),
      getFiles()
    )


  },
  requestCodeOwnershipData,
  receiveCodeOwnershipData,
  receiveCodeOwnershipDataError
);


