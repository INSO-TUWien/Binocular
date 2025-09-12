import { put, takeEvery, fork, call, select, takeLatest } from 'redux-saga/effects';
import { State, DataState, dataSlice, setCurrentBranch } from '../reducer';
import { DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import { DataPluginCommitBuild } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommitsBuilds.ts';
import { getCommitDataForSha, getDefaultBranch, getFilenamesForBranch, getOwnershipForCommits, getPreviousFilenames } from './helper.ts';
import { CodeOwnershipData } from '../../../code-ownership/src/reducer/index.ts';
import { PreviousFileData } from '../../../../../types/data/ownershipType.ts';

export default function* (dataConnection: DataPlugin) {
  yield fork(() => watchRefresh(dataConnection));
  yield fork(() => watchBranchChange(dataConnection));
}

function* watchRefresh(dataConnection: DataPlugin) {
  yield takeEvery('REFRESH', () => fetchExpertiseData(dataConnection));
}

function* watchBranchChange(dataConnection: DataPlugin) {
  yield takeLatest(setCurrentBranch, () => fetchExpertiseData(dataConnection));
}

function* fetchExpertiseData(dataConnection: DataPlugin) {
  const { setData, setDataState } = dataSlice.actions;
  yield put(setDataState(DataState.FETCHING));
  const state: { plugin: State } = yield select();
  const branchId = state.plugin.branch;

  const codeOwnershipData: CodeOwnershipData = yield call(async () => {
    if (!dataConnection.branches) return;
    const branches = (await dataConnection.branches.getAllBranches()).sort((a, b) => a.branch.localeCompare(b.branch));
    let currentBranch = undefined;
    if (!branchId) currentBranch = getDefaultBranch(branches);
    else currentBranch = branches[branchId];

    const result: CodeOwnershipData = { rawData: [], previousFilenames: {} };

    if (currentBranch === null || currentBranch === undefined) {
      return result;
    }

    // get data for latest commit on the selected branch
    return getCommitDataForSha(currentBranch.latestCommit, dataConnection)
      .then(async (latestBranchCommit) => {
        if (!latestBranchCommit) {
          throw new Error('Latest branch commit not found');
        }

        const activeFiles = await getFilenamesForBranch(currentBranch.branch, dataConnection);

        //get previous filenames for all active files
        const previousFilenames: { [p: string]: PreviousFileData[] } = await getPreviousFilenames(
          activeFiles,
          currentBranch,
          dataConnection,
        );
        //get actual ownership data for all commits on the selected branch
        let relevantOwnershipData = await getOwnershipForCommits(latestBranchCommit, dataConnection);
        if (relevantOwnershipData.length === 0) {
          throw new Error('No ownership data found for the current branch');
        }

        //sort by date
        relevantOwnershipData = relevantOwnershipData.sort(
          (a: { date: string | number | Date }, b: { date: string | number | Date }) =>
            new Date(a.date).getTime() - new Date(b.date).getTime(),
        );

        result.rawData = relevantOwnershipData;
        result.previousFilenames = previousFilenames;
        //result.ownershipForFiles = extractFileOwnership(relevantOwnershipData);

        return result;
      })
      .catch((e) => {
        console.log('Error in code ownership saga: ', e);
        return {};
      });
  });
  const commitsBuilds: DataPluginCommitBuild[] = yield call(() =>
    dataConnection.commits.getCommitsWithBuilds(new Date(0).toISOString(), new Date().toISOString()),
  );
  const commitsBuildsFiltered = commitsBuilds.filter((cb) => codeOwnershipData.rawData?.find((o) => cb.sha === o.sha));

  yield put(setData({ ownershipData: codeOwnershipData, buildsData: commitsBuildsFiltered }));
  yield put(setDataState(DataState.COMPLETE));
}
