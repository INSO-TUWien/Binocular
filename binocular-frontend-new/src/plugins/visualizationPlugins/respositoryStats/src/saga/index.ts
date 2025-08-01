import { put, takeEvery, fork, call, select } from 'redux-saga/effects';
import { RepoStatsState, DataState, setCommits, setDataState, setDateRange, setIssues, setUsers, setBuilds } from '../reducer';
import { DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import { DataPluginUser } from '../../../../interfaces/dataPluginInterfaces/dataPluginUsers.ts';
import { DataPluginCommit } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';
import { DataPluginIssue } from '../../../../interfaces/dataPluginInterfaces/dataPluginIssues.ts';
import { DataPluginBuild } from '../../../../interfaces/dataPluginInterfaces/dataPluginBuilds.ts';

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
  const state: { plugin: RepoStatsState } = yield select();
  const commits: DataPluginCommit[] = yield call(() =>
    dataConnection.commits.getAll(state.plugin.dateRange.from, state.plugin.dateRange.to),
  );
  const users: DataPluginUser[] = yield call(() => dataConnection.users.getAll());
  const issues: DataPluginIssue[] = yield call(() => dataConnection.issues.getAll(state.plugin.dateRange.from, state.plugin.dateRange.to));
  const builds: DataPluginBuild[] = yield call(() => dataConnection.builds.getAll(state.plugin.dateRange.from, state.plugin.dateRange.to));
  yield put(setCommits(commits.length));
  yield put(setUsers(users.length));
  yield put(setIssues(issues.length));
  yield put(setBuilds(builds.length));
  yield put(setDataState(DataState.COMPLETE));
}
