import { DataPlugin } from "../../../../interfaces/dataPlugin.ts";
import { put, takeEvery, fork, call } from "redux-saga/effects";
import { DataState, setDataState, setDateRange, setAccounts } from "../reducer";
import { DataPluginAccount } from "../../../../interfaces/dataPluginInterfaces/dataPluginAccount.ts";
import { SagaIterator } from "redux-saga";

export default function* (dataConnection: DataPlugin) {
  yield fork(() => watchRefresh(dataConnection));
  yield fork(() => watchDateRangeChange(dataConnection));
}

function* watchRefresh(dataConnection: DataPlugin) {
  yield takeEvery("REFRESH", fetchCollaborationData, dataConnection);
}

function* watchDateRangeChange(dataConnection: DataPlugin) {
  yield takeEvery(setDateRange, fetchCollaborationData, dataConnection);
}

function* fetchCollaborationData(dataConnection: DataPlugin): SagaIterator {
  yield put(setDataState(DataState.FETCHING));

  const rawAccounts: DataPluginAccount[] = yield call(() =>
    dataConnection.accountsIssues.getAll(),
  );

  yield put(setAccounts(rawAccounts));

  yield put(setDataState(DataState.COMPLETE));
}
