import { put, takeEvery, fork, call, select } from "redux-saga/effects";
import { State, DataState, dataSlice } from "../reducer";
import { DataPlugin } from "../../../../interfaces/dataPlugin.ts";
import {
  DataPluginCommitBuild,
  DataPluginCommitsBuilds,
} from "../../../../interfaces/dataPluginInterfaces/dataPluginCommitsBuilds.ts";
import { DataPluginCommit } from "../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts";
import _ from "lodash";

export default function* <DataType>(dataConnection: DataPlugin) {
  yield fork(() => watchRefresh<DataType>(dataConnection));
  yield fork(() => watchDateRangeChange<DataType>(dataConnection));
}

function* watchRefresh<DataType>(dataConnection: DataPlugin) {
  yield takeEvery("REFRESH", () => fetchChangesData<DataType>(dataConnection));
}

function* watchDateRangeChange<DataType>(dataConnection: DataPlugin) {
  yield takeEvery(dataSlice.actions.setDateRange, () =>
    fetchChangesData<DataType>(dataConnection),
  );
}

function* fetchChangesData<DataType>(dataConnection: DataPlugin) {
  const { setData, setDataState } = dataSlice.actions;
  yield put(setDataState(DataState.FETCHING));
  const state: State<DataType> = yield select();

  // Fetch data
  const commitsBuilds: DataPluginCommitBuild[] = yield call(() =>
    dataConnection.commits.getCommitsWithBuilds(
      state.plugin.dateRange.from,
      state.plugin.dateRange.to,
    ),
  );
  const commits: DataPluginCommit[] = yield call(() =>
    dataConnection.commits.getAll(
      state.plugin.dateRange.from,
      state.plugin.dateRange.to,
    ),
  );

  // Convert regular commits to DataPluginCommitBuild format (with build set to undefined)
  const commitsAsCommitBuilds: DataPluginCommitBuild[] = commits.map(
    (commit) => ({
      ...commit,
      builds: undefined,
    }),
  );

  // Combine both arrays and use lodash to remove duplicates where commitsBuilds gets prefered
  const combinedCommits = _.uniqBy(
    [...commitsBuilds, ...commitsAsCommitBuilds],
    "sha",
  );
  yield put(setData(combinedCommits));
  yield put(setDataState(DataState.COMPLETE));
}
