import { put, takeEvery, fork, call, select } from 'redux-saga/effects';
import { ChangesState, DataState, setCommits, setDataState, setDateRange } from '../reducer';
import { DataCommit, DataPlugin } from '../../../../interfaces/dataPlugin.ts';

export default function* (dataConnection: DataPlugin) {
  yield fork(() => watchRefresh(dataConnection));
  yield fork(() => watchDateRangeChange(dataConnection));
}

function* watchRefresh(dataConnection: DataPlugin) {
  yield takeEvery('REFRESH', () => fetchChangesData(dataConnection));
}

function* watchDateRangeChange(dataConnection: DataPlugin) {
  yield takeEvery(setDateRange, () => fetchChangesData(dataConnection));
}

function* fetchChangesData(dataConnection: DataPlugin) {
  yield put(setDataState(DataState.FETCHING));
  const state: ChangesState = yield select();
  const commits: DataCommit[] = yield call(() => dataConnection.commits.getAll(state.dateRange.from, state.dateRange.to));
  yield put(setCommits(commits));
  yield put(setDataState(DataState.COMPLETE));
}
