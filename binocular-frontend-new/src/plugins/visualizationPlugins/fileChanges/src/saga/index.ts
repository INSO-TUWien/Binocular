import { put, takeEvery, fork, call, throttle } from 'redux-saga/effects';
import { DataState, current_file, setCurrentFileCommits, setDataState, setDateRange, setDateOfOverallFirstCommit, setDateOfOverallLastCommit } from '../reducer';
import { DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import { DataPluginCommit } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';

export default function* (dataConnection: DataPlugin) {
  yield fork(() => watchRefresh(dataConnection));
  yield fork(() => watchDateRangeChange(dataConnection));
}

function* watchRefresh(dataConnection: DataPlugin) {
  yield throttle(5000, 'REFRESH', () => fetchChangesData(dataConnection));
}

function* watchDateRangeChange(dataConnection: DataPlugin) {
  yield takeEvery(setDateRange, () => fetchChangesData(dataConnection));
}

function* fetchChangesData(dataConnection: DataPlugin) {
  yield put(setDataState(DataState.FETCHING));

  const current_file_commits : DataPluginCommit[] = yield call(() => dataConnection.commits.getByFile(current_file));

  const dateOfOverallFirstCommit : string = yield call(() => dataConnection.commits.getDateOfFirstCommit());
  const dateOfOverallLastCommit : string = yield call(() => dataConnection.commits.getDateOfLastCommit());

  yield put(setCurrentFileCommits(current_file_commits))
  yield put(setDateOfOverallFirstCommit(dateOfOverallFirstCommit))
  yield put(setDateOfOverallLastCommit(dateOfOverallLastCommit))
  yield put(setDataState(DataState.COMPLETE));
}
