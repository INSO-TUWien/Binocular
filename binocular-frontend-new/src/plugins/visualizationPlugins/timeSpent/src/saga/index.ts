import { put, takeEvery, fork, call, select, throttle } from 'redux-saga/effects';
import { TimeSpentState, DataState, setNotes, setDataState, setDateRange } from '../reducer';
import { DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import { DataPluginNote } from '../../../../interfaces/dataPluginInterfaces/dataPluginNote.ts';

export default function* (dataConnection: DataPlugin) {
  yield fork(() => watchRefresh(dataConnection));
  yield fork(() => watchDateRangeChange(dataConnection));
}

function* watchRefresh(dataConnection: DataPlugin) {
  yield throttle(5000, 'REFRESH', () => fetchTimeSpentData(dataConnection));
}

function* watchDateRangeChange(dataConnection: DataPlugin) {
  yield takeEvery(setDateRange, () => fetchTimeSpentData(dataConnection));
}

function* fetchTimeSpentData(dataConnection: DataPlugin) {
  yield put(setDataState(DataState.FETCHING));
  const state: TimeSpentState = yield select();
  const notes: DataPluginNote[] = yield call(() => dataConnection.notes.getAll(state.dateRange.from, state.dateRange.to));
  yield put(setNotes(notes));
  yield put(setDataState(DataState.COMPLETE));
}
