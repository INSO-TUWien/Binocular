import { put, takeEvery, fork, call, select, takeLatest } from 'redux-saga/effects';
import { State, DataState, dataSlice, setCurrentBranch } from '../reducer';
import { DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import { DataPluginCommitBuild } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommitsBuilds.ts';
import { DataPluginOwnership } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';
import { getDefaultBranch, getOwnershipForCommits } from './helper.ts';
import { CodeOwnershipData } from '../../../code-ownership/src/reducer/index.ts';
import { DataPluginBranch } from '../../../../interfaces/dataPluginInterfaces/dataPluginBranches.ts';

export default function* <DataType>(dataConnection: DataPlugin) {
  yield fork(() => watchRefresh<DataType>(dataConnection));
  yield fork(() => watchBranchChange(dataConnection));
}

function* watchRefresh<DataType>(dataConnection: DataPlugin) {
  yield takeEvery('REFRESH', () => fetchExpertiseData<DataType>(dataConnection));
}

function* watchBranchChange(dataConnection: DataPlugin) {
  yield takeLatest(setCurrentBranch, () => fetchExpertiseData(dataConnection));
}

function* fetchExpertiseData<DataType>(dataConnection: DataPlugin) {
  const { setData, setDataState } = dataSlice.actions;
  yield put(setDataState(DataState.FETCHING));
  const state: { plugin: State<DataType> } = yield select();
  const branchId = state.plugin.branch;

  if (!dataConnection.branches) return;
  // Get branches and determine current branch
  const branches: DataPluginBranch[] = yield call(() => dataConnection.branches!.getAllBranches());
  branches.sort((a, b) => a.branch.localeCompare(b.branch));
  let currentBranch = undefined;
  if (!branchId) currentBranch = getDefaultBranch(branches);
  else currentBranch = branches[branchId];
  console.log(currentBranch);
  const result: CodeOwnershipData = { rawData: [], previousFilenames: {} };

  if (currentBranch === null || currentBranch === undefined) {
    return result;
  }

  // Fetch data
  const commitsBuilds: DataPluginCommitBuild[] = yield call(() =>
    dataConnection.commits.getCommitsWithBuilds(new Date(0).toISOString(), new Date().toISOString()),
  );
  const commitsBuildsFiltered = commitsBuilds.filter((commit) => commit.branch === currentBranch.branch);

  const ownership: DataPluginOwnership[] = yield call(async () => {
    //get actual ownership data for all commits on the selected branch
    let relevantOwnershipData = await getOwnershipForCommits(dataConnection);
    if (relevantOwnershipData.length === 0) {
      throw new Error('No ownership data found for the current branch');
    }
    //sort by date
    relevantOwnershipData = relevantOwnershipData.sort(
      (a: { date: string | number | Date }, b: { date: string | number | Date }) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    return relevantOwnershipData;
  });
  console.log(commitsBuildsFiltered);
  const ownershipBySha = ownership.filter((o) => commitsBuildsFiltered.find((c) => c.sha === o.sha));

  yield put(setData({ ownership: ownershipBySha, builds: commitsBuildsFiltered }));
  yield put(setDataState(DataState.COMPLETE));
}
