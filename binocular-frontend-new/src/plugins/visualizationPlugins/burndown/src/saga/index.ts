import { put, takeEvery, fork, call, select } from 'redux-saga/effects';
import { DataState, type IssuesState, setDataState, setDateRange, setIssues } from '../reducer';
import type { DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import type { DataPluginIssue } from '../../../../interfaces/dataPluginInterfaces/dataPluginIssues.ts';

export default function* (dataConnection: DataPlugin) {
  yield fork(() => watchRefresh(dataConnection));
  yield fork(() => watchDateRangeChange(dataConnection));
}

function* watchRefresh(dataConnection: DataPlugin) {
  yield takeEvery('REFRESH', () => fetchIssuesData(dataConnection));
}

function* watchDateRangeChange(dataConnection: DataPlugin) {
  yield takeEvery(setDateRange, () => fetchIssuesData(dataConnection));
}

function* fetchIssuesData(dataConnection: DataPlugin) {
  yield put(setDataState(DataState.FETCHING));
  const state: { plugin: IssuesState } = yield select();
  const issues: DataPluginIssue[] = yield call(() => dataConnection.issues.getAll(state.plugin.dateRange.from, state.plugin.dateRange.to));

  yield put(setIssues(issues));
  yield put(setDataState(DataState.COMPLETE));
}
