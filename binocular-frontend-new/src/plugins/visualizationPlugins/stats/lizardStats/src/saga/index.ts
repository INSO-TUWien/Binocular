import { put, fork, call, throttle } from 'redux-saga/effects';
import { DataState, setDataState, setLizardRows } from '../reducer';
import type { DataPlugin } from '../../../../../interfaces/dataPlugin.ts';
import type { DataPluginLizard } from '../../../../../interfaces/dataPluginInterfaces/dataPluginLizard.ts';

export default function* (dataConnection: DataPlugin) {
  yield fork(() => watchRefresh(dataConnection));
}

function* watchRefresh(dataConnection: DataPlugin) {
  yield throttle(5000, 'REFRESH', () => fetchLizardData(dataConnection));
}

function* fetchLizardData(dataConnection: DataPlugin) {
  yield put(setDataState(DataState.FETCHING));

  const lizardRows: DataPluginLizard[] = yield call(
    [dataConnection.lizards, dataConnection.lizards.getAll],
  );

  yield put(setLizardRows(lizardRows));
  yield put(setDataState(DataState.COMPLETE));
}
