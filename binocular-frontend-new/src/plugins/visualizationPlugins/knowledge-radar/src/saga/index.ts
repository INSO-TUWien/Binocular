import { put, takeEvery, fork, call, select } from 'redux-saga/effects';
import { State, DataState, dataSlice } from '../reducer';
import { DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import {DataPluginFiles, DataPluginFile} from "../../../../interfaces/dataPluginInterfaces/dataPluginFiles.ts";
import _ from 'lodash';

export default function* <DataType>(dataConnection: DataPlugin) {
  yield fork(() => watchRefresh<DataType>(dataConnection));
  yield fork(() => watchDateRangeChange<DataType>(dataConnection));
}

function* watchRefresh<DataType>(dataConnection: DataPlugin) {
  yield takeEvery('REFRESH', () => fetchChangesData<DataType>(dataConnection));
}

function* watchDateRangeChange<DataType>(dataConnection: DataPlugin) {
  yield takeEvery(dataSlice.actions.setDateRange, () => fetchChangesData<DataType>(dataConnection));
}

function* fetchChangesData<DataType>(dataConnection: DataPlugin) {
  const { setData, setDataState } = dataSlice.actions;
  yield put(setDataState(DataState.FETCHING));
  const state: State<DataType> = yield select();

  // Fetch data
  const commitFiles: DataPluginFile[] = yield call(() => dataConnection.commits.getCommitsWithFiles(state.dateRange.from, state.dateRange.to));
  yield put(setData(commitFiles));
  yield put(setDataState(DataState.COMPLETE));
}
