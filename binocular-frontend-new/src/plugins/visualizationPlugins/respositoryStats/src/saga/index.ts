import { put, takeEvery, fork, call, select } from 'redux-saga/effects';
import {
  type RepoStatsState,
  DataState,
  setDateRange,
  setDataState,
  setCommits,
  setUsers,
  setIssues,
  setBuilds,
  setMergeRequests,
} from '../reducer';
import type { DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import type { DataPluginUser } from '../../../../interfaces/dataPluginInterfaces/dataPluginUsers.ts';
import type { DataPluginCommit } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';
import type { DataPluginIssue } from '../../../../interfaces/dataPluginInterfaces/dataPluginIssues.ts';
import type { DataPluginBuild } from '../../../../interfaces/dataPluginInterfaces/dataPluginBuilds.ts';
import type { DataPluginMergeRequest } from '../../../../interfaces/dataPluginInterfaces/dataPluginMergeRequests';

export default function* (dataConnection: DataPlugin) {
  yield fork(() => watchRefresh(dataConnection));
  yield fork(() => watchDateRangeChange(dataConnection));
}

function* watchRefresh(dataConnection: DataPlugin) {
  yield takeEvery('REFRESH', () => fetchData(dataConnection));
}

function* watchDateRangeChange(dataConnection: DataPlugin) {
  yield takeEvery(setDateRange, () => fetchData(dataConnection));
}

function* fetchData(dataConnection: DataPlugin) {
  yield put(setDataState(DataState.FETCHING));
  const state: { plugin: RepoStatsState } = yield select();
  const commits: DataPluginCommit[] = yield call(() =>
    dataConnection.commits.getAll(state.plugin.dateRange.from, state.plugin.dateRange.to),
  );
  const users: DataPluginUser[] = yield call(() => dataConnection.users.getAll());
  const issues: DataPluginIssue[] = yield call(() => dataConnection.issues.getAll(state.plugin.dateRange.from, state.plugin.dateRange.to));
  const builds: DataPluginBuild[] = yield call(() => dataConnection.builds.getAll(state.plugin.dateRange.from, state.plugin.dateRange.to));
  const mergeRequests: DataPluginMergeRequest[] = yield call(() =>
    dataConnection.mergeRequests.getAll(state.plugin.dateRange.from, state.plugin.dateRange.to),
  );
  yield put(setCommits(commits.length));
  yield put(setUsers(users.length));
  yield put(setIssues(issues.length));
  yield put(setBuilds(builds.length));
  yield put(setMergeRequests(mergeRequests.length));
  yield put(setDataState(DataState.COMPLETE));
}
