import { put, takeEvery, fork, call, select } from 'redux-saga/effects';
import { ChangesState, setCommits } from '../reducer';
import { DataCommit, DataPlugin } from '../../../../interfaces/dataPlugin.ts';

export default function* (dataConnection: DataPlugin) {
  yield fork(() => watchRefresh(dataConnection));
  yield fork(() => watchDateRangeChange(dataConnection));
}

function* watchRefresh(dataConnection: DataPlugin) {
  yield takeEvery('REFRESH', () => fetchChangesData(dataConnection));
}

function* watchDateRangeChange(dataConnection: DataPlugin) {
  yield takeEvery('changes/setDateRange', () => fetchChangesData(dataConnection));
}

function* fetchChangesData(dataConnection: DataPlugin) {
  const state: ChangesState = yield select();
  const commits: DataCommit[] = yield call(() => dataConnection.commits.getAll(state.dateRange.from, state.dateRange.to));
  yield put(setCommits(commits));
}
