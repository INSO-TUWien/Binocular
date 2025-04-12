import { put, takeEvery, fork, call, select } from 'redux-saga/effects';
import { State, DataState, dataSlice } from '../reducer';
import { DataPlugin } from '../../../../interfaces/dataPlugin.ts';

export default function* <DataType>(dataConnection: DataPlugin, name?: string) {
  yield fork(() => watchRefresh<DataType>(dataConnection, name!));
  yield fork(() => watchDateRangeChange<DataType>(dataConnection, name!));
}

function* watchRefresh<DataType>(dataConnection: DataPlugin, name: string) {
  yield takeEvery('REFRESH', () => fetchChangesData<DataType>(dataConnection, name));
}

function* watchDateRangeChange<DataType>(dataConnection: DataPlugin, name: string) {
  yield takeEvery(dataSlice.actions.setDateRange, () => fetchChangesData<DataType>(dataConnection, name));
}

function* fetchChangesData<DataType>(dataConnection: DataPlugin, name: string) {
  const { setData, setDataState } = dataSlice.actions;
  yield put(setDataState(DataState.FETCHING));
  const state: State<DataType> = yield select();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  const commits: DataType[] = yield call(() => dataConnection.commits_builds.getAll(state.dateRange.from, state.dateRange.to));
  const builds: DataType[] = yield call(() => dataConnection.builds.getAll(state.dateRange.from, state.dateRange.to));
  yield put(setData([commits, builds]));
  yield put(setDataState(DataState.COMPLETE));
  console.log(state)
}
