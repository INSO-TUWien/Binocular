import {
  put,
  takeEvery,
  fork,
  call,
  select,
  throttle,
} from "redux-saga/effects";
import {
  DataState,
  CollaborationState,
  setDataState,
  setDateRange,
  setAccounts,
} from "../reducer";
import { DataPlugin } from "../../../../interfaces/dataPlugin.ts";
import { DataPluginAccount } from "../../../../interfaces/dataPluginInterfaces/dataPluginAccount.ts";

export default function* (dataConnection: DataPlugin) {
  yield fork(() => watchRefresh(dataConnection));
  yield fork(() => watchDateRangeChange(dataConnection));
}

function* watchRefresh(dataConnection: DataPlugin) {
  yield throttle(5000, "REFRESH", () => fetchCollaborationData(dataConnection));
}

function* watchDateRangeChange(dataConnection: DataPlugin) {
  yield takeEvery(setDateRange, () => fetchCollaborationData(dataConnection));
}

function* fetchCollaborationData(dataConnection: DataPlugin) {
  yield put(setDataState(DataState.FETCHING));
  const state: CollaborationState = yield select();
  const rawAccounts: DataPluginAccount[] = yield call(() =>
    dataConnection.accountsIssues.getAll(
      state.dateRange.from,
      state.dateRange.to,
    ),
  );
  yield put(setAccounts(rawAccounts));
  yield put(setDataState(DataState.COMPLETE));
}
