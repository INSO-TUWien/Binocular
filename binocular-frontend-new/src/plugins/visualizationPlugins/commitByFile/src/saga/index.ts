import { DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import { call, fork, put, select, takeEvery, throttle } from 'redux-saga/effects';
import { CommitByFileState, DataState, setCommitFiles, setCommits, setDataState, setSha } from '../reducer';
import { DataPluginCommitFile } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommitsFiles.ts';
import { DataPluginCommitShort } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';

export default function* (dataConnection: DataPlugin) {
  yield fork(watchRefresh, dataConnection);
  yield fork(watchShaChange, dataConnection);
}

function* watchRefresh(dataConnection: DataPlugin) {
  yield throttle(1000, 'REFRESH', () => fetchCommitsAndCommitByFileData(dataConnection));
}

function* watchShaChange(dataConnection: DataPlugin) {
  yield takeEvery(setSha, () => fetchCommitData(dataConnection));
}

function* fetchCommitData(dataConnection: DataPlugin) {
  yield* fetchCommitByFileData(dataConnection);
}

function* fetchCommitsAndCommitByFileData(dataConnection: DataPlugin) {
  yield put(setDataState(DataState.FETCHING));
  const commits: DataPluginCommitShort[] = yield call(() => dataConnection.commits.getAllShort());
  if (commits.length === 0) {
    yield put(
      setCommits([
        {
          sha: '',
          messageHeader: 'No Commits Found',
          date: '',
        },
      ]),
    );
  } else {
    yield put(setCommits(commits));
  }

  yield* fetchCommitByFileData(dataConnection);
}

function* fetchCommitByFileData(dataConnection: DataPlugin) {
  const state: CommitByFileState = yield select();
  const commitByFile: DataPluginCommitFile[] = yield call(() => dataConnection.commitByFile.getAll(state.sha));

  if (commitByFile.length === 0) {
    yield put(setDataState(DataState.EMPTY));
  } else {
    yield put(setCommitFiles(commitByFile));
    yield put(setDataState(DataState.COMPLETE));
  }
}
