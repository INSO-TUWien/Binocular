import { put, takeEvery, fork, call, throttle, select } from 'redux-saga/effects';
import { ChangesState, DataState, setCurrentFile, setCurrentFileCommits, setDataState, setDateRange } from '../reducer';
import { DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import { DataPluginCommit } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';

export default function* (dataConnection: DataPlugin) {
  yield fork(() => watchRefresh(dataConnection));
  yield fork(() => watchDateRangeChange(dataConnection));
  yield fork(() => watchCurrentFileChange(dataConnection));
}

function* watchRefresh(dataConnection: DataPlugin) {
  yield throttle(5000, 'REFRESH', () => fetchChangesData(dataConnection));
}

function* watchDateRangeChange(dataConnection: DataPlugin) {
  yield takeEvery(setDateRange, () => fetchChangesData(dataConnection));
}

function* watchCurrentFileChange(dataConnection: DataPlugin) {
  yield takeEvery(setCurrentFile, () => fetchChangesData(dataConnection));
}

function* fetchChangesData(dataConnection: DataPlugin) {
  yield put(setDataState(DataState.FETCHING));

  const state : ChangesState = yield select();
  console.log("State:", state);

  // TODO: File list ist in global state. 
  //const files : DataPluginFile[] = yield call(() => dataConnection.files.getAll());

  // TODO: get actual state from settings
  var current_file = state.current_file;
  if (current_file == "") {
    current_file = state.files[0].path;
  }

  const current_file_commits : DataPluginCommit[] = yield call(() => dataConnection.commits.getByFile(current_file));

  //yield put(setFiles(files));
  yield put(setCurrentFileCommits(current_file_commits))
  yield put(setDataState(DataState.COMPLETE));
}
