import { put, takeEvery, fork, call, select, throttle } from 'redux-saga/effects';
import { type CodeHotspotsState, DataState, setBranches, setCommits, setDataState, setDateRange, setFile } from '../reducer';
import type { DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import type { DataPluginCommit } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';
import type { DataPluginBranch } from '../../../../interfaces/dataPluginInterfaces/dataPluginBranches';

export default function* (dataConnection: DataPlugin) {
  yield fork(() => watchRefresh(dataConnection));
  yield fork(() => watchDateRangeChange(dataConnection));
  yield fork(() => watchFileChange(dataConnection));
}

function* watchRefresh(dataConnection: DataPlugin) {
  yield throttle(5000, 'REFRESH', () => fetchChangesData(dataConnection));
}

function* watchDateRangeChange(dataConnection: DataPlugin) {
  yield takeEvery(setDateRange, () => fetchChangesData(dataConnection));
}

function* watchFileChange(dataConnection: DataPlugin) {
  yield takeEvery(setFile, () => fetchChangesData(dataConnection));
}

function* fetchChangesData(dataConnection: DataPlugin) {
  yield put(setDataState(DataState.FETCHING));
  const state: { plugin: CodeHotspotsState } = yield select();
  if (state.plugin.selectedFile && state.plugin.selectedFile.path) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const commits: DataPluginCommit[] = yield call(() => dataConnection.commits.getByFile(state.plugin.selectedFile.path));
    const branches: DataPluginBranch[] = yield call(() => dataConnection.branches.getAll());

    yield put(setCommits(commits));
    yield put(setBranches(branches));
  }

  yield put(setDataState(DataState.COMPLETE));
}
