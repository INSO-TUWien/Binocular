import { put, takeEvery, fork, call, select, throttle } from 'redux-saga/effects';
import { DataState, type CollaborationState, setDataState, setDateRange, setAccounts } from '../reducer';
import type { DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import type { DataPluginAccountIssues } from '../../../../interfaces/dataPluginInterfaces/dataPluginAccountsIssues.ts';

export default function* (dataConnection: DataPlugin) {
  yield fork(() => watchRefresh(dataConnection));
  yield fork(() => watchDateRangeChange(dataConnection));
}

function* watchRefresh(dataConnection: DataPlugin) {
  yield throttle(5000, 'REFRESH', () => fetchCollaborationData(dataConnection));
}

function* watchDateRangeChange(dataConnection: DataPlugin) {
  yield takeEvery(setDateRange, () => fetchCollaborationData(dataConnection));
}

function* fetchCollaborationData(dataConnection: DataPlugin) {
  yield put(setDataState(DataState.FETCHING));

  const state: CollaborationState = yield select((root: { plugin: CollaborationState }) => root.plugin);

  const rawAccounts: DataPluginAccountIssues[] = yield call(() =>
    dataConnection.accountsIssues.getAll(state.dateRange.from, state.dateRange.to),
  );

  yield put(setAccounts(rawAccounts));
  yield put(setDataState(DataState.COMPLETE));
}
