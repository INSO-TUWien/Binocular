import { put, takeEvery, fork, call, select } from 'redux-saga/effects';
import { State, DataState, dataSlice } from '../reducer';
import { DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import { DataPluginCommit } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';

export default function* (dataConnection: DataPlugin) {
  yield fork(() => watchRefresh(dataConnection));
  yield fork(() => watchDateRangeChange(dataConnection));
}

function* watchRefresh(dataConnection: DataPlugin) {
  yield takeEvery('REFRESH', () => fetchChangesData(dataConnection));
}

function* watchDateRangeChange(dataConnection: DataPlugin) {
  yield takeEvery(dataSlice.actions.setDateRange, () => fetchChangesData(dataConnection));
}

function* fetchChangesData(dataConnection: DataPlugin) {
  const { setData, setDataState } = dataSlice.actions;
  yield put(setDataState(DataState.FETCHING));
  const state: State = yield select();

  const commitFiles: DataPluginCommit[] = yield call(() =>
    dataConnection.commits.getCommitsWithFiles(state.plugin.dateRange.from, state.plugin.dateRange.to),
  );

  yield put(setData(commitFiles));
  yield put(setDataState(DataState.COMPLETE));
}
