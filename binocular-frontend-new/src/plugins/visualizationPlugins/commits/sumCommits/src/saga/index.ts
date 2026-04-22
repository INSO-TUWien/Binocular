import { put, takeEvery, fork, call, select, throttle } from 'redux-saga/effects';
import { DataState, setCommits, setDataState, setDateRange, type SumCommitsState } from '../reducer';
import type { DataPlugin } from '../../../../../interfaces/dataPlugin.ts';
import type { DataPluginCommit } from '../../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';

export default function* (dataConnection: DataPlugin) {
  yield fork(() => watchRefresh(dataConnection));
  yield fork(() => watchDateRangeChange(dataConnection));
}

function* watchRefresh(dataConnection: DataPlugin) {
  yield throttle(5000, 'REFRESH', () => fetchSumCommitsData(dataConnection));
}

function* watchDateRangeChange(dataConnection: DataPlugin) {
  yield takeEvery(setDateRange, () => fetchSumCommitsData(dataConnection));
}

function* fetchSumCommitsData(dataConnection: DataPlugin) {
  yield put(setDataState(DataState.FETCHING));
  const state: { plugin: SumCommitsState } = yield select();
  const commits: DataPluginCommit[] = yield call(
    [dataConnection.commits, dataConnection.commits.getAll],
    state.plugin.dateRange.from,
    state.plugin.dateRange.to,
  );
  yield put(setCommits(commits));
  yield put(setDataState(DataState.COMPLETE));
}
