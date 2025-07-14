import { all, takeEvery, select, fork, call } from '@redux-saga/core/effects';
import { createAction } from '@reduxjs/toolkit';

import { DataPlugin } from '../../../../interfaces/dataPlugin';
import { FileChangeData } from '../reducer/data';
import { ChangeFrequencyConfigState } from '../reducer/config';
import { generateFullHierarchy, getHierarchyForPath, clearHierarchyCache, HierarchyNode } from '../utilities/utilities';
import { store as globalStore } from '../../../../../redux';

// Action creators
export const setChangeFrequencyConfig = createAction<Partial<ChangeFrequencyConfigState>>('SET_CHANGE_FREQUENCY_CONFIG');

// Store the original file data for navigation
let originalFileData: FileChangeData[] = [];

interface Commit {
  sha?: string;
  date: string;
  signature?: string;
  files?: { data: any[] };
}

interface PathChangeAction {
  type: string;
  payload?: {
    currentPath?: string;
    hierarchyStack?: any;
  };
}

interface ChangeFrequencyState {
  state?: {
    currentPath?: string;
    hierarchyStack?: string[];
  };
  loading?: boolean;
  hierarchyData?: any[];
}

// Function to process the loaded commit data
function processCommits(commits: Commit[] = []) {
  const fileMap = new Map<string, FileChangeData>();

  for (const commit of commits) {
    if (!commit) continue;

    const files = commit.files?.data || [];

    for (const file of files) {
      if (!file) continue;

      const filePath = file.file.path;
      if (!filePath) continue;

      const additions = file.stats.additions !== undefined ? Number(file.stats.additions) : 0;
      const deletions = file.stats.deletions !== undefined ? Number(file.stats.deletions) : 0;
      const lineCount = file.lineCount !== undefined ? Number(file.lineCount) : 0;

      if (!fileMap.has(filePath)) {
        fileMap.set(filePath, {
          path: filePath,
          commitCount: 0,
          totalAdditions: 0,
          totalDeletions: 0,
          totalChanges: 0,
          lineCount: lineCount,
          commits: [],
          firstModification: commit.date,
          lastModification: commit.date,
          owners: {},
        });
      }

      const fileData = fileMap.get(filePath);
      if (fileData) {
        fileData.commitCount += 1;
        fileData.totalAdditions += additions;
        fileData.totalDeletions += deletions;
        fileData.totalChanges += additions + deletions;

        if (lineCount > 0) {
          fileData.lineCount = lineCount;
        }

        if (commit.date) {
          if (!fileData.firstModification || new Date(commit.date) < new Date(fileData.firstModification)) {
            fileData.firstModification = commit.date;
          }
          if (!fileData.lastModification || new Date(commit.date) > new Date(fileData.lastModification)) {
            fileData.lastModification = commit.date;
          }
        }

        const author = commit.signature || 'Unknown';
        if (!fileData.owners) {
          fileData.owners = {};
        }

        if (!fileData.owners[author]) {
          fileData.owners[author] = { additions: 0, deletions: 0, changes: 0 };
        }

        if (fileData.owners[author]) {
          fileData.owners[author].additions += additions;
          fileData.owners[author].deletions += deletions;
          fileData.owners[author].changes += additions + deletions;
        }

        if (commit.sha && fileData.commits) {
          fileData.commits.push(commit.sha);
        }
      }
    }
  }

  return fileMap;
}

// Function to load all necessary data for the visualization
export function* loadData(dataConnection: DataPlugin): Generator<any, void, unknown> {
  try {
    const state = (yield select((state: any) => state.changeFrequency)) as ChangeFrequencyState;
    if (state?.loading) {
      return;
    }

    globalStore.dispatch({ type: 'changeFrequency/setGlobalLoading', payload: true });

    let fileMap = new Map<string, FileChangeData>();

    try {
      const globalState = globalStore.getState();
      const globalDateRange = globalState.parameters?.parametersDateRange;
      const commitSpan = globalDateRange
        ? [globalDateRange.from, globalDateRange.to]
        : [new Date(0).toISOString(), new Date().toISOString()];
      const formattedCommitSpan: [Date, Date] = [new Date(commitSpan[0]), new Date(commitSpan[1])];

      if (!dataConnection.commits?.getCommitDataWithFilesAndOwnership) {
        throw new Error('Required method getCommitDataWithFilesAndOwnership not found in dataConnection');
      }

      const commits = yield call(() =>
        dataConnection.commits.getCommitDataWithFilesAndOwnership!(formattedCommitSpan, formattedCommitSpan),
      );

      if (commits && Array.isArray(commits) && commits.length > 0) {
        fileMap = processCommits(commits);
      }
    } catch (error) {
      console.error('Error loading commit data:', error);
      throw error;
    }

    if (fileMap.size === 0) {
      globalStore.dispatch({ type: 'changeFrequency/setGlobalHierarchyData', payload: [] });
      globalStore.dispatch({ type: 'changeFrequency/setGlobalLoading', payload: false });
      return;
    }

    const fileData: FileChangeData[] = [];
    for (const file of fileMap.values()) {
      fileData.push({
        ...file,
        averageChangesPerCommit: file.commitCount > 0 ? file.totalChanges / file.commitCount : 0,
      });
    }

    originalFileData = fileData;

    const fullHierarchy = generateFullHierarchy(fileData);

    const currentPath = state?.state?.currentPath || '';

    let hierarchyData;
    if (!currentPath) {
      hierarchyData = fullHierarchy;
    } else {
      const node = getHierarchyForPath(currentPath);
      hierarchyData = node && node.children ? node.children : [];
    }

    globalStore.dispatch({ type: 'changeFrequency/setGlobalHierarchyData', payload: hierarchyData });
    globalStore.dispatch({ type: 'changeFrequency/setGlobalLoading', payload: false });
  } catch (error) {
    console.error('Error in loadData:', error);
    globalStore.dispatch({ type: 'changeFrequency/setGlobalHierarchyData', payload: [] });
    globalStore.dispatch({ type: 'changeFrequency/setGlobalLoading', payload: false });
  }
}

// Function to subscribe to global store for both navigation and parameter changes
function setupGlobalStoreWatcher() {
  let lastState = globalStore.getState().changeFrequency?.state;
  let lastDateRange = globalStore.getState().parameters?.parametersDateRange;

  globalStore.subscribe(() => {
    const currentState = globalStore.getState().changeFrequency?.state;
    const currentDateRange = globalStore.getState().parameters?.parametersDateRange;

    if (JSON.stringify(currentState) !== JSON.stringify(lastState)) {
      console.log('Global store navigation state changed:', { lastState, currentState });
      lastState = currentState;

      if (currentState) {
        const currentPath = currentState.currentPath || '';

        let hierarchyData: HierarchyNode[];
        if (!currentPath) {
          hierarchyData = generateFullHierarchy(originalFileData);
        } else {
          const node = getHierarchyForPath(currentPath);
          hierarchyData = node && node.children ? node.children : [];
        }
        globalStore.dispatch({ type: 'changeFrequency/setGlobalHierarchyData', payload: hierarchyData });
      }
    }

    if (JSON.stringify(currentDateRange) !== JSON.stringify(lastDateRange)) {
      console.log('Global date range changed:', { lastDateRange, currentDateRange });
      lastDateRange = currentDateRange;

      clearHierarchyCache();
      globalStore.dispatch({ type: 'changeFrequency/reloadData' });
    }
  });
}

// Function to generate hierarchy data when path changes (keeping for local store compatibility)
export function* watchForPathChanges(): Generator<any, void, unknown> {
  yield takeEvery('changeFrequency/setGlobalState', function* handlePathChange(action: PathChangeAction): Generator<any, void, unknown> {
    if (action.payload && (action.payload.currentPath !== undefined || action.payload.hierarchyStack !== undefined)) {
      let currentPath = '';
      if (action.payload.currentPath !== undefined) {
        currentPath = action.payload.currentPath;
      }

      let hierarchyData: HierarchyNode[];
      if (!currentPath) {
        hierarchyData = generateFullHierarchy(originalFileData);
      } else {
        const node = getHierarchyForPath(currentPath);
        hierarchyData = node && node.children ? node.children : [];
      }

      globalStore.dispatch({ type: 'changeFrequency/setGlobalHierarchyData', payload: hierarchyData });
    }
  });
}

export function* watchForConfigChanges(dataConnection: DataPlugin): Generator<any, void, unknown> {
  yield takeEvery('SET_CHANGE_FREQUENCY_CONFIG', function* handleConfigChange(): Generator<any, void, unknown> {
    clearHierarchyCache();
    yield call(loadData, dataConnection);
  });
}

export function* watchForDataReload(dataConnection: DataPlugin): Generator<any, void, unknown> {
  yield takeEvery('changeFrequency/reloadData', function* handleDataReload(): Generator<any, void, unknown> {
    yield call(loadData, dataConnection);
  });
}

export default function* root(dataConnection: DataPlugin): Generator<any, void, unknown> {
  setupGlobalStoreWatcher();

  yield fork(loadData, dataConnection);

  yield all([fork(watchForConfigChanges, dataConnection), fork(watchForPathChanges), fork(watchForDataReload, dataConnection)]);
}
