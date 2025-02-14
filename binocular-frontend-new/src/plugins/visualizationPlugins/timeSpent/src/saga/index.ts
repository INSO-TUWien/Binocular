import { put, takeEvery, fork, call, select, throttle } from 'redux-saga/effects';
import { TimeSpentState, DataState, setTimeSpent, setDataState, setDateRange } from '../reducer';
import { DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import { DataPluginTimeSpent } from '../../../../interfaces/dataPluginInterfaces/dataPluginTimeSpent.ts';

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
  console.log(dataConnection);
  const timeSpentEntries: DataPluginTimeSpent[] = yield call(() =>
    dataConnection.timeSpent.getAll(state.dateRange.from, state.dateRange.to),
  );
  yield put(setTimeSpent(timeSpentEntries));
  yield put(setDataState(DataState.COMPLETE));
}
