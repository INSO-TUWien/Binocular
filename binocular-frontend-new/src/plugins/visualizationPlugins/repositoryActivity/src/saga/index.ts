import { put, fork, call, select, takeEvery, throttle } from 'redux-saga/effects';
import type { DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import { DataState, type RepositoryActivityState, setData, setDataState, setDateRange } from '../reducer';
import type { DataPluginCommit } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits';

export default function* (dataConnection: DataPlugin) {
  yield fork(watchRefresh, dataConnection);
  yield fork(watchDateRangeChange, dataConnection);
}

function* watchRefresh(dataConnection: DataPlugin) {
  yield throttle(5000, 'REFRESH', fetchData, dataConnection);
}

function* watchDateRangeChange(dataConnection: DataPlugin) {
  yield takeEvery(setDateRange.type, fetchData, dataConnection);
}

function* fetchData(dataConnection: DataPlugin) {
  yield put(setDataState(DataState.FETCHING));
  const state: { plugin: RepositoryActivityState } = yield select();

  const commits: DataPluginCommit[] = yield call(
    [dataConnection.commits, dataConnection.commits.getAll],
    state.plugin.dateRange.from,
    state.plugin.dateRange.to,
  );

  yield put(setData(commits));
  yield put(setDataState(DataState.COMPLETE));
}
