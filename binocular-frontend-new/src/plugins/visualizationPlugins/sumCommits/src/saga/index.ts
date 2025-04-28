import { put, takeEvery, fork, call, select, throttle } from 'redux-saga/effects';
import { SumCommitsState, DataState, setCommits, setDataState, setDateRange } from '../reducer';
import { DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import { DataPluginCommit } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';

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
  const state: SumCommitsState = yield select();
  const commits: DataPluginCommit[] = yield call(() => dataConnection.commits.getAll(state.dateRange.from, state.dateRange.to));
  yield put(setCommits(commits));
  yield put(setDataState(DataState.COMPLETE));
}
