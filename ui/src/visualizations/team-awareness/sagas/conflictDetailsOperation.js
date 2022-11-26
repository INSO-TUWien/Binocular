import { receiveTeamAwarenessFileConflictDetails } from './index';
import { put, select } from 'redux-saga/effects';
import { getState } from '../util/util';

function* processFileConflictDetails() {
  const appState = yield select();
  yield put(receiveTeamAwarenessFileConflictDetails(yield analyseFileConflictDetails(appState)));
}

const analyseFileConflictDetails = async appState => {
  const { data: { data: { fileDetails } } } = getState(appState);

  // TODO: Process file details conflict
  //  Fetch two files from github
  //  Load them via AST library
  //  Compare them
  //  Give feedback according to the AST data

  return { fileDetails };
};

export { processFileConflictDetails };
