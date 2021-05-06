'use strict';
import { createAction } from 'redux-actions';
import { takeEvery, put, fork } from 'redux-saga/effects';
import moment from 'moment';
import { graphQl } from '../../../utils';
export const requestCodeFileData = createAction('REQUEST_CODE_FILE_DATA');
export const setSelectedBlames = createAction('SET_SELECTED_BLAMES');
export const updateOverlay = createAction('UPDATE_OVERLAY');
export const updateCode = createAction(
  'UPDATE_CODE',
  updates => updates,
  () => ({ receivedAt: moment() })
);

export default function*() {
  yield fork(watchRequestCodeFileData);
  yield fork(watchRequestAllFiles);
  yield fork(watchSetSelectedBlames);
  yield put({ type: 'REQUEST_ALL_FILES' });
}

// TODO DON'T HARDCODE project ID and branch
function fetchFile(path, ref = 'master') {
  const gitLabAPI = 'https://gitlab.com/api/v4/';
  const token = 'XXXXXXXXXXXXXX'; // TODO USE TOKEN from .pupilrc
  const url = `${gitLabAPI}projects/17659390/repository/files/${encodeURIComponent(
    path
  )}?ref=${ref}`;
  return fetch(url, {
    headers: {
      'PRIVATE-TOKEN': token
    }
  })
    .then(res => {
      return res.json();
    })
    .then(data => {
      return atob(data.content);
    });
}

function fetchAllFiles() {
  return graphQl
    .query(
      `{
         files: allFiles {
            id,
            path,
            webUrl,
            maxLength
         }
       }`
    )
    .then(resp => resp.files);
}

function fetchBlame(fileID) {
  return graphQl
    .query(
      `{
         blame (fileID: ${fileID}) {
          commitsFiles {
            lineCount
            hunks {
              newStart
              newLines
              oldStart
              oldLines
              webUrl
            }
          }
          commit {
            sha
            signature
            date
            message
            webUrl
            stats {
              additions
              deletions
            }
           }
         }
       }`
    )
    .then(resp => resp.blame);
}

function* watchRequestCodeFileData() {
  yield takeEvery('REQUEST_CODE_FILE_DATA', handleRequestCodeFileData);
}

function* handleRequestCodeFileData({ payload }) {
  const file = payload;
  const code = yield fetchFile(file.path);
  let blame = yield fetchBlame(file.id);
  const fetchCommitFiles = function*(blame) {
    for (const entry of blame) {
      const commitFile = yield fetchFile(file.path, entry.commit.sha);
      entry.commit.fileContent = commitFile;
    }
  };
  yield fetchCommitFiles(blame);
  yield put({
    type: 'RECEIVE_ALL_BLAMES',
    payload: {
      blames: blame
    },
    meta: { receivedAt: moment() }
  });
  yield put({
    type: 'RECEIVE_CODE_FILE_DATA',
    payload: {
      linesOfCode: file.maxLength,
      code
    },
    meta: { receivedAt: moment() }
  });
}

function* watchSetSelectedBlames() {
  yield takeEvery('SET_SELECTED_BLAMES', handleSetSelectedBlames);
}

function* handleSetSelectedBlames({ payload }) {
  if (payload.length > 0) {
    const blame = payload.slice(-1)[0];
    yield put({
      type: 'UPDATE_CODE',
      payload: {
        linesOfCode: blame.commitsFiles.lineCount,
        code: blame.commit.fileContent
      },
      meta: { receivedAt: moment() }
    });
  } else {
    yield put({
      type: 'UPDATE_CODE',
      payload: {},
      meta: { receivedAt: moment() }
    });
  }
  yield put({
    type: 'UPDATE_OVERLAY',
    payload: {},
    meta: { receivedAt: moment() }
  });
}

function* handleRequestAllFiles() {
  const files = yield fetchAllFiles();
  yield put({
    type: 'RECEIVE_ALL_FILES',
    payload: {
      files
    },
    meta: { receivedAt: moment() }
  });
}

function* watchRequestAllFiles() {
  yield takeEvery('REQUEST_ALL_FILES', handleRequestAllFiles);
}
