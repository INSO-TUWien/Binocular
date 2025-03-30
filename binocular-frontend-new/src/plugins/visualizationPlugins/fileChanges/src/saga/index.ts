import { put, takeEvery, fork, call, throttle, select } from 'redux-saga/effects';
import { DataState, current_file, setCurrentFileCommits, setCurrentFileTotalCommits, setDataState, setDateRange, setDateOfOverallFirstCommit, setDateOfOverallLastCommit, ChangesState } from '../reducer';
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
  const state: ChangesState = yield select();

  const current_file_commits : DataPluginCommit[] = yield call(() => dataConnection.commits.getByFile(current_file, state.dateRange.from, state.dateRange.to));

  const dateOfOverallFirstCommit : string = yield call(() => dataConnection.commits.getDateOfFirstCommit());
  const dateOfOverallLastCommit : string = yield call(() => dataConnection.commits.getDateOfLastCommit());

  const current_file_total_commits : DataPluginCommit[] = yield call(() => dataConnection.commits.getByFile(current_file, dateOfOverallFirstCommit, dateOfOverallLastCommit));

  console.log("Cur: ", current_file_commits);
  console.log("Total: ", current_file_total_commits);

  yield put(setCurrentFileCommits(current_file_commits))
  yield put(setDateOfOverallFirstCommit(dateOfOverallFirstCommit))
  yield put(setDateOfOverallLastCommit(dateOfOverallLastCommit))
  yield put(setCurrentFileTotalCommits(current_file_total_commits))
  yield put(setDataState(DataState.COMPLETE));
}
