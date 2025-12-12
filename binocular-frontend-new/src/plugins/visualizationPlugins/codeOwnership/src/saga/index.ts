import { put, takeLatest, fork, call, select } from 'redux-saga/effects';
import { DataState, setDataState, setData, type CodeOwnershipData, type CodeOwnershipState, setCurrentBranch } from '../reducer';
import type { DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import { getCommitDataForSha, getFilenamesForBranch, getLatestBranch, getOwnershipForCommits, getPreviousFilenames } from './helper.ts';
import type { PreviousFileData } from '../../../../../types/data/ownershipType.ts';
import type { DataPluginBranch } from '../../../../interfaces/dataPluginInterfaces/dataPluginBranches.ts';

export default function* (dataConnection: DataPlugin) {
  yield fork(() => watchRefresh(dataConnection));
  yield fork(() => watchBranchChange(dataConnection));
}

function* watchRefresh(dataConnection: DataPlugin) {
  yield takeLatest('REFRESH', () => fetchCodeOwnershipData(dataConnection));
}

function* watchBranchChange(dataConnection: DataPlugin) {
  yield takeLatest(setCurrentBranch, () => fetchCodeOwnershipData(dataConnection));
}

function* fetchCodeOwnershipData(dataConnection: DataPlugin) {
  const state: { plugin: CodeOwnershipState } = yield select();
  yield put(setDataState(DataState.FETCHING));
  const branchId = state.plugin.branch;
  const data: CodeOwnershipData = yield call(async () => {
    if (!dataConnection.branches) return;
    const branches = (await dataConnection.branches.getAll()).sort((a, b) => a.branch.localeCompare(b.branch));
    let currentBranch: DataPluginBranch | null | undefined = undefined;
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

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const activeFiles = await getFilenamesForBranch(currentBranch.branch, dataConnection);

        //get previous filenames for all active files
        const previousFilenames: { [p: string]: PreviousFileData[] } = await getPreviousFilenames(
          activeFiles,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
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
  yield put(setData(data));
  yield put(setDataState(DataState.COMPLETE));
}
