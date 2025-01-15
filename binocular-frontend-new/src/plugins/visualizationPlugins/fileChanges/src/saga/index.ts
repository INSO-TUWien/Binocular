import { put, takeEvery, fork, call, throttle } from 'redux-saga/effects';
import { DataState, setCurrentFileCommits, setDataState, setDateRange, setFiles } from '../reducer';
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

function* fetchChangesData(dataConnection: DataPlugin) {
  yield put(setDataState(DataState.FETCHING));
  const files : DataPluginFile[] = yield call(() => dataConnection.files.getAll());
  const current_file_commits : DataPluginCommit[] = yield call(() => dataConnection.commits.getByFile("init.lua"));
  yield put(setFiles(files));
  yield put(setCurrentFileCommits(current_file_commits))
  yield put(setDataState(DataState.COMPLETE));
}
