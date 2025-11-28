import { put, takeEvery, fork, call, select, throttle } from 'redux-saga/effects';
import { type CodeHotspotsState, DataState, setCommits, setDataState, setDateRange } from '../reducer';
import type { DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import type { DataPluginCommit } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';

export default function* (dataConnection: DataPlugin) {
  yield fork(() => watchRefresh(dataConnection));
  yield fork(() => watchDateRangeChange(dataConnection));
}

function* watchRefresh(dataConnection: DataPlugin) {
  yield throttle(5000, 'REFRESH', () => fetchChangesData(dataConnection));
}

function* watchDateRangeChange(dataConnection: DataPlugin) {
  yield takeEvery(setDateRange, () => fetchChangesData(dataConnection));
}

function* fetchChangesData(dataConnection: DataPlugin) {
  yield put(setDataState(DataState.FETCHING));
  const state: { plugin: CodeHotspotsState } = yield select();
  const commits: DataPluginCommit[] = yield call(() =>
    dataConnection.commits.getAll(state.plugin.dateRange.from, state.plugin.dateRange.to),
  );
  yield put(setCommits(commits));
  yield put(setDataState(DataState.COMPLETE));
}
