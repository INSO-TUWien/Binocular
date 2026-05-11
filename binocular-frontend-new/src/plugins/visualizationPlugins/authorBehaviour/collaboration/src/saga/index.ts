import { put, takeEvery, fork, call, select, throttle } from 'redux-saga/effects';
import { DataState, type CollaborationState, setDataState, setDateRange, setIssueAccounts, setMrAccounts, setCommits } from '../reducer';
import type { DataPlugin } from '../../../../../interfaces/dataPlugin.ts';
import type { DataPluginAccountIssues } from '../../../../../interfaces/dataPluginInterfaces/dataPluginAccountsIssues.ts';
import type { DataPluginAccountMergeRequests } from '../../../../../interfaces/dataPluginInterfaces/dataPluginAccountsMergeRequests.ts';
import type { DataPluginCommit } from '../../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';

export default function* (dataConnection: DataPlugin) {
  yield fork(() => watchRefresh(dataConnection));
  yield fork(() => watchDateRangeChange(dataConnection));
}

function* watchRefresh(dataConnection: DataPlugin) {
  yield throttle(500, 'REFRESH', () => fetchCollaborationData(dataConnection));
}

function* watchDateRangeChange(dataConnection: DataPlugin) {
  yield takeEvery(setDateRange, () => fetchCollaborationData(dataConnection));
}

function* fetchCollaborationData(dataConnection: DataPlugin) {
  yield put(setDataState(DataState.FETCHING));

  const state: CollaborationState = yield select((root: { plugin: CollaborationState }) => root.plugin);

  const issueAccounts: DataPluginAccountIssues[] = yield call(() =>
    dataConnection.accountsIssues.getAll(state.dateRange.from, state.dateRange.to),
  );

  const mrAccounts: DataPluginAccountMergeRequests[] = yield call(() =>
    dataConnection.accountsMergeRequests.getAll(state.dateRange.from, state.dateRange.to),
  );

  const commits: DataPluginCommit[] = yield call(() => dataConnection.commits.getAll(state.dateRange.from, state.dateRange.to));

  yield put(setIssueAccounts(issueAccounts));
  yield put(setMrAccounts(mrAccounts));
  yield put(setCommits(commits));
  yield put(setDataState(DataState.COMPLETE));
}
