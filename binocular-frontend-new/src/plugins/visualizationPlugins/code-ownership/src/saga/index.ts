import { put, takeEvery, fork, call } from 'redux-saga/effects';
import { DataState, setDateRange, setDataState, setData, CodeOwnershipData } from '../reducer';
import { DataPlugin } from '../../../../interfaces/dataPlugin.ts';
import { getCommitDataForSha, getFilenamesForBranch, getOwnershipForCommits, getPreviousFilenames } from './helper.ts';

export default function* (dataConnection: DataPlugin) {
  yield fork(() => watchRefresh(dataConnection));
  yield fork(() => watchDateRangeChange(dataConnection));
}

function* watchRefresh(dataConnection: DataPlugin) {
  yield takeEvery('REFRESH', () => fetchCodeOwnershipData(dataConnection));
}

function* watchDateRangeChange(dataConnection: DataPlugin) {
  yield takeEvery(setDateRange, () => fetchCodeOwnershipData(dataConnection));
}

function* fetchCodeOwnershipData(dataConnection: DataPlugin) {
  yield put(setDataState(DataState.FETCHING));
  const data: CodeOwnershipData = yield call(() => {
    const currentBranch = {
      branch: 'develop',
      active: 'false',
      tracksFileRenames: 'true',
      latestCommit: '5f13d85a7c3a2e62711e5e78f79f04854ecc5907',
    };

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
        const previousFilenames: { [p: string]: string[] } = await getPreviousFilenames(activeFiles, currentBranch, dataConnection);
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
