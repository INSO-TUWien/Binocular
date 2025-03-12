import { put, takeEvery, fork, call, throttle } from 'redux-saga/effects';
import { DataState, current_file, setCurrentFileCommits, setDataState, setDateRange, setGlobalFiles } from '../reducer';
import { DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import { DataPluginFile } from '../../../../interfaces/dataPluginInterfaces/dataPluginFiles.ts';
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

//function* fetchChangesData(dataConnection: DataPlugin) {
//  yield put(setDataState(DataState.FETCHING));
//
//  const state : ChangesState = yield select();
//  console.log("State:", state);
//
//  if (state.current_file != "" && state.current_file == state.last_current_file) {
//    yield put(setDataState(DataState.COMPLETE));
//    return;
//  }
//
//  // TODO: File list ist in global state. 
//  const files : DataPluginFile[] = yield call(() => dataConnection.files.getAll());
//
//  // TODO: get actual state from settings
//  var current_file = state.current_file;
//  if (current_file == "") {
//    if (files.length == 0) {
//      yield put(setDataState(DataState.COMPLETE));
//      return;
//    }
//    current_file = files[0].path;
//  }
//
//  console.log("Files:", files);
//  console.log("Current file:", current_file);
//
//  const current_file_commits : DataPluginCommit[] = yield call(() => dataConnection.commits.getByFile(current_file));
//
//  yield put(setFiles(files));
//  yield put(setCurrentFile(current_file));
//  yield put(setCurrentFileCommits(current_file_commits))
//  yield put(setDataState(DataState.COMPLETE));
//}

function* fetchChangesData(dataConnection: DataPlugin) {
  yield put(setDataState(DataState.FETCHING));

  // TODO: File list ist in global state. 
  const files : DataPluginFile[] = yield call(() => dataConnection.files.getAll());
  setGlobalFiles(files);

  const current_file_commits : DataPluginCommit[] = yield call(() => dataConnection.commits.getByFile(current_file));
  yield put(setCurrentFileCommits(current_file_commits))
  yield put(setDataState(DataState.COMPLETE));
}
