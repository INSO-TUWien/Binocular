import { put, fork, call, select, takeLatest } from 'redux-saga/effects';
import { type State, DataState, setDataState, setData, setCurrentBranch, type ExpertiseData } from '../reducer';
import type { DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import type { DataPluginCommitBuild } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';
import { getCommitDataForSha, getFilenamesForBranch, getLatestBranch, getOwnershipForCommits, getPreviousFilenames } from './helper.ts';
import type { CodeOwnershipData } from '../../../codeOwnership/src/reducer/index.ts';
import type { PreviousFileData } from '../../../../../types/data/ownershipType.ts';
import type { DataPluginBranch } from '../../../../interfaces/dataPluginInterfaces/dataPluginBranches';

export default function* (dataConnection: DataPlugin) {
  yield fork(() => watchRefresh(dataConnection));
  yield fork(() => watchBranchChange(dataConnection));
}

function* watchRefresh(dataConnection: DataPlugin) {
  yield takeLatest('REFRESH', () => fetchExpertiseData(dataConnection));
}

function* watchBranchChange(dataConnection: DataPlugin) {
  yield takeLatest(setCurrentBranch, () => fetchExpertiseData(dataConnection));
}

function* fetchExpertiseData(dataConnection: DataPlugin) {
  const state: { plugin: State } = yield select();
  yield put(setDataState(DataState.FETCHING));
  const branchId = state.plugin.branch;

  const codeOwnershipData: CodeOwnershipData = yield call(async () => {
    if (!dataConnection.branches) return;
    const branches = (await dataConnection.branches.getAll()).sort((a, b) => a.branch.localeCompare(b.branch));
    let currentBranch: DataPluginBranch | undefined = undefined;
    if (!branchId) currentBranch = await getLatestBranch(branches, dataConnection);
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

        const activeFiles = await getFilenamesForBranch(currentBranch!.branch, dataConnection);

        //get previous filenames for all active files
        const previousFilenames: { [p: string]: PreviousFileData[] } = await getPreviousFilenames(
          activeFiles,
          currentBranch!,
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
  const result: ExpertiseData = { ownershipData: codeOwnershipData, buildsData: commitsBuildsFiltered };
  yield put(setData(result));
  yield put(setDataState(DataState.COMPLETE));
}
