import { DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import { call, fork, put, select, takeEvery } from 'redux-saga/effects';
import { CommitByFileState, DataState, setCommitFiles, setDataState, setSha } from '../reducer';
import { DataPluginCommitFileChanges } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommitsFilesChanges.ts';

export default function* (dataConnection: DataPlugin) {
  yield fork(watchRefresh, dataConnection);
  yield fork(watchShaChange, dataConnection);
}

function* watchRefresh(dataConnection: DataPlugin) {
  yield takeEvery('REFRESH', () => fetchCommitByFileData(dataConnection));
}

function* watchShaChange(dataConnection: DataPlugin) {
  yield takeEvery(setSha, () => fetchCommitByFileData(dataConnection));
}

function* fetchCommitByFileData(dataConnection: DataPlugin) {
  yield put(setDataState(DataState.FETCHING));
  const state: CommitByFileState = yield select();
  const commitByFile: DataPluginCommitFileChanges[] = yield call(() => dataConnection.commitByFile.getAll(state.sha));
  if (commitByFile.length === 0) {
    yield put(setDataState(DataState.EMPTY));
  } else {
    yield put(setCommitFiles(commitByFile));
    yield put(setDataState(DataState.COMPLETE));
  }
}
