import { put, takeEvery, fork, call, throttle } from 'redux-saga/effects';
import {
  DataState,
  current_file,
  setCurrentFileTotalCommits,
  setDataState,
  setDateRange,
  setDateOfOverallFirstCommit,
  setDateOfOverallLastCommit,
  setCurrentFile,
} from '../reducer';
import { DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import { DataPluginCommit } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';

export default function* (dataConnection: DataPlugin) {
  yield fork(() => watchRefresh(dataConnection));
  yield fork(() => watchDateRangeChange(dataConnection));
  yield fork(() => watchFileChange(dataConnection));
}

function* watchFileChange(dataConnection: DataPlugin) {
  yield takeEvery(setCurrentFile, () => fetchChangesData(dataConnection));
}

function* watchRefresh(dataConnection: DataPlugin) {
  yield throttle(5000, 'REFRESH', () => fetchChangesData(dataConnection));
}

function* watchDateRangeChange(dataConnection: DataPlugin) {
  yield takeEvery(setDateRange, () => fetchChangesData(dataConnection));
}

function* fetchChangesData(dataConnection: DataPlugin) {
  yield put(setDataState(DataState.FETCHING));

  const current_file_total_commits: DataPluginCommit[] = yield call(() => dataConnection.commits.getByFile(current_file));

  const dateOfOverallFirstCommit: string = yield call(() => dataConnection.commits.getDateOfFirstCommit());
  const dateOfOverallLastCommit: string = yield call(() => dataConnection.commits.getDateOfLastCommit());

  yield put(setDateOfOverallFirstCommit(dateOfOverallFirstCommit));
  yield put(setDateOfOverallLastCommit(dateOfOverallLastCommit));
  yield put(setCurrentFileTotalCommits(current_file_total_commits));
  yield put(setDataState(DataState.COMPLETE));
}
