'use strict';

import Promise from 'bluebird';
import { createAction } from 'redux-actions';
import { throttle, fork, takeEvery, select } from 'redux-saga/effects';

import { fetchFactory, timestampedActionFactory, mapSaga } from '../../../sagas/utils.js';
import getCommitData from './getCommitData.js';
import getBranches from './getBranches.js';
import getCommiters from './getCommiters.js';
import getFiles from './getFiles.js';

export const setCommitBoxHeight = createAction('SET_COMMIT_BOX_HEIGHT');
export const setCommitBoxWidth = createAction('SET_COMMIT_BOX_WIDTH');
export const setCommitBoxColor = createAction('SET_COMMIT_BOX_COLOR');
export const setCommitBoxSort = createAction('SET_COMMIT_BOX_SORT');

export const setSelectedAuthors = createAction('SET_SELECTED_AUTHORS');
export const setSelectedBranches = createAction('SET_SELECTED_BRANCHES');

export const setShowCommitDate = createAction('SET_SHOW_COMMIT_DATE');
export const setShowCommitSha = createAction('SET_SHOW_COMMIT_SHA');
export const setShowCommitMessage = createAction('SET_SHOW_COMMIT_MESSAGE');
export const setShowCommitWeblink = createAction('SET_SHOW_COMMIT_WEBLINK');
export const setShowCommitAuthor = createAction('SET_SHOW_COMMIT_AUTHOR');
export const setShowCommitFiles = createAction('SET_SHOW_COMMIT_FILES');
export const setShowCommitBranch = createAction('SET_SHOW_COMMIT_BRANCH');

export const requestFileEvolutionData = createAction('REQUEST_FILE_EVOLUTION_DATA');
export const receiveFileEvolutionData = timestampedActionFactory('RECEIVE_FILE_EVOLUTION_DATA');
export const receiveFileEvolutionDataError = createAction('RECEIVE_FILE_EVOLUTION_DATA_ERROR');

export const requestRefresh = createAction('REQUEST_REFRESH');
const refresh = createAction('REFRESH');

export default function*() {
  // fetch data once on entry
  yield* fetchFileEvolutionData();

  yield fork(watchRefreshRequests);
  yield fork(watchMessages);

  // keep looking for viewport changes to re-fetch
  yield fork(watchRefresh);
  yield fork(watchToggleHelp);
}

function* watchRefreshRequests() {
  yield throttle(2000, 'REQUEST_REFRESH', mapSaga(refresh));
}

function* watchMessages() {
  yield takeEvery('message', mapSaga(requestRefresh));
}

function* watchToggleHelp() {
  yield takeEvery('TOGGLE_HELP', mapSaga(refresh));
}

function* watchRefresh() {
  yield takeEvery('REFRESH', fetchFileEvolutionData);
}

/**
 * Fetch data for FILE EVOLUTION, this still includes old functions that were copied over.
 */
export const fetchFileEvolutionData = fetchFactory(
  function*() {
    //const commiters = yield getCommiters();
    return yield Promise.join(getCommitData(), getBranches(), getCommiters(), getFiles())
      .spread((commits, branches, commiters, files) => {
        console.log(commits);
        const authorsColorPalette = getAuthorColorPalette(commiters);
        const branchesColorPalette = getBranchesColorPalette(branches);
        const commitFiles = addFilesToCommit(files, commits);
        console.log(commitFiles);
        console.log(files);
        return {
          files,
          commitFiles,
          commits,
          branches,
          commiters,
          authorsColorPalette,
          branchesColorPalette
        };
      })
      .catch(function(e) {
        console.error(e.stack);
        throw e;
      });
  },
  requestFileEvolutionData,
  receiveFileEvolutionData,
  receiveFileEvolutionDataError
);

function addFilesToCommit(files, commits) {
  const commitFiles = {};
  for (const c in commits) {
    const sha = '' + commits[c].sha;
    commitFiles[sha] = [];
  }
  for (const f in files) {
    const file = files[f];
    for (const c in files[f].commits.data) {
      const fileSha = '' + files[f].commits.data[c].sha;
      commitFiles[fileSha].push(file);
    }
  }
  return commitFiles;
}

function getAuthorColorPalette(commiters) {
  //TODO Color???
  const colorPalette = {};
  for (const i in commiters) {
    let randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
    while (randomColor.length !== 7) {
      randomColor = randomColor + '0';
    }
    colorPalette[commiters[i].gitSignature] = randomColor;
  }
  return colorPalette;
}

function getBranchesColorPalette(branches) {
  //TODO Color???
  const colorPalette = {};
  for (const i in branches) {
    let randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
    while (randomColor.length !== 7) {
      randomColor = randomColor + '0';
    }
    colorPalette[branches[i].branch] = randomColor;
  }
  let randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
  while (randomColor.length !== 7) {
    randomColor = randomColor + '0';
  }
  colorPalette['tags/v1.0.0'] = randomColor;
  console.log(colorPalette);
  return colorPalette;
}
