import type { DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import { call, fork, put, select, takeEvery, throttle } from 'redux-saga/effects';
import { type CommitByFileState, DataState, setCommitFiles, setCommits, setDataState, setSha } from '../reducer';
import type { DataPluginCommitFile } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommitsFiles.ts';
import type { DataPluginCommitShort } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';

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
  console.log(commits);
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
  const state: { plugin: CommitByFileState } = yield select();
  console.log(state);
  const commitByFile: DataPluginCommitFile[] = yield call(() => dataConnection.commitByFile.getAll(state.plugin.sha));

  if (commitByFile.length === 0) {
    yield put(setDataState(DataState.EMPTY));
  } else {
    yield put(setCommitFiles(commitByFile));
    yield put(setDataState(DataState.COMPLETE));
  }
}
