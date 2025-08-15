import { put, takeEvery, fork, call, select } from 'redux-saga/effects';
import { DataState, type MergeRequestsState, setDataState, setDateRange, setMergeRequests } from '../reducer';
import type { DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import type { DataPluginMergeRequest } from '../../../../interfaces/dataPluginInterfaces/dataPluginMergeRequests.ts';

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
  const state: { plugin: MergeRequestsState } = yield select();
  const mergeRequests: DataPluginMergeRequest[] = yield call(() =>
    dataConnection.mergeRequests.getAll(state.plugin.dateRange.from, state.plugin.dateRange.to),
  );
  yield put(setMergeRequests(mergeRequests));
  yield put(setDataState(DataState.COMPLETE));
}
