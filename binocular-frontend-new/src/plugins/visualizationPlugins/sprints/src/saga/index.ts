import { put, takeEvery, fork, call, select } from 'redux-saga/effects';
import { DataState, type IssuesState, setDataState, setDateRange, setIssues } from '../reducer';
import type { DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import type { DataPluginIssue } from '../../../../interfaces/dataPluginInterfaces/dataPluginIssues.ts';
import type { DataPluginMergeRequest } from '../../../../interfaces/dataPluginInterfaces/dataPluginMergeRequests.ts';

export default function* (dataConnection: DataPlugin) {
  yield fork(() => watchRefresh(dataConnection));
  yield fork(() => watchDateRangeChange(dataConnection));
}

function* watchRefresh(dataConnection: DataPlugin) {
  yield takeEvery('REFRESH', () => fetchIssuesAndMergeRequestsData(dataConnection));
}

function* watchDateRangeChange(dataConnection: DataPlugin) {
  yield takeEvery(setDateRange, () => fetchIssuesAndMergeRequestsData(dataConnection));
}

function* fetchIssuesAndMergeRequestsData(dataConnection: DataPlugin) {
  yield put(setDataState(DataState.FETCHING));
  const state: { plugin: IssuesState } = yield select();
  const issues: DataPluginIssue[] = yield call(() => dataConnection.issues.getAll(state.plugin.dateRange.from, state.plugin.dateRange.to));
  const mergeRequests: DataPluginMergeRequest[] = yield call(() =>
    dataConnection.mergeRequests.getAll(state.plugin.dateRange.from, state.plugin.dateRange.to),
  );

  yield put(setIssues({ issues, mergeRequests }));
  yield put(setDataState(DataState.COMPLETE));
}
