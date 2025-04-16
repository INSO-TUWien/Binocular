import { DataPlugin } from "../../../../interfaces/dataPlugin.ts";
import { call, fork, put, takeEvery, throttle } from "redux-saga/effects";
import { DataState, setDataState, setDateRange, setIssues } from "../reducer";
import { convertIssuesToGraphData } from "../utilities/dataConverter.ts";
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
  const rawAccounts: DataPluginAccount[] = yield call(() =>
    dataConnection.accountsIssues.getAll(),
  );
  const graphData = convertIssuesToGraphData(rawAccounts);
  yield put(setIssues(graphData));
  yield put(setDataState(DataState.COMPLETE));
}
