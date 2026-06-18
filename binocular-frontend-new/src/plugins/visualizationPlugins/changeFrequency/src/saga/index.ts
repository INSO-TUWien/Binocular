import { fork, takeLatest, takeEvery, select, call, put } from 'redux-saga/effects';

import type { DataPlugin } from '../../../../interfaces/dataPlugin';
import type { CommitWithFileChanges } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits';
import type { FileChangeData } from '../reducer/data';
import { generateFullHierarchy, getHierarchyLevel } from '../utilities/hierarchy';
import { setFileData, setHierarchyData, setLoading, setNavigation, setDateRange, type ChangeFrequencyState } from '../reducer';

interface PluginRootState {
  plugin: ChangeFrequencyState;
}

// Process the loaded commit data into a per-file aggregation.
//
// Commits may span a wider range than the visible window: those outside it carry
// `isSignificant: false` and contribute only to the current line count (file size), while the
// change metrics (commit count, additions/deletions, ownership, modification dates) come from the
// significant commits alone. A missing `isSignificant` is treated as significant.
export function processCommits(commits: CommitWithFileChanges[] = []): FileChangeData[] {
  const fileMap = new Map<string, FileChangeData>();
  // Commit date of the most recent non-zero line count seen per file (across all commits),
  // so the current file size is not overwritten by older commits.
  const lineCountAt = new Map<string, number>();

  for (const commit of commits) {
    if (!commit) continue;

    const significant = commit.isSignificant !== false;
    const commitTime = commit.date ? new Date(commit.date).getTime() : 0;
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
          lineCount: 0,
          commits: [],
          owners: {},
        });
      }

      const fileData = fileMap.get(filePath);
      if (!fileData) continue;

      // Current file size: keep the most recent non-zero line count, from any commit (significant
      // or not) so cumulative context outside the window still sizes the file correctly.
      if (lineCount > 0 && commitTime >= (lineCountAt.get(filePath) ?? -Infinity)) {
        fileData.lineCount = lineCount;
        lineCountAt.set(filePath, commitTime);
      }

      // Change metrics only count commits within the significant (visible) window.
      if (!significant) continue;

      fileData.commitCount += 1;
      fileData.totalAdditions += additions;
      fileData.totalDeletions += deletions;
      fileData.totalChanges += additions + deletions;

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
      fileData.owners[author].additions += additions;
      fileData.owners[author].deletions += deletions;
      fileData.owners[author].changes += additions + deletions;

      if (commit.sha && fileData.commits) {
        fileData.commits.push(commit.sha);
      }
    }
  }

  const result: FileChangeData[] = [];
  for (const file of fileMap.values()) {
    // Drop files only touched outside the window (no significant commits -> not a data point).
    if (file.commitCount === 0) continue;
    result.push({
      ...file,
      averageChangesPerCommit: file.commitCount > 0 ? file.totalChanges / file.commitCount : 0,
    });
  }
  return result;
}

// Load all data for the visualization and compute the hierarchy level for the current path.
function* loadData(dataConnection: DataPlugin) {
  try {
    yield put(setLoading(true));

    // Clear the previously shown data up front so the stale tree from the old data plugin (or date
    // range) is not displayed while the new data is being fetched.
    yield put(setFileData([]));
    yield put(setHierarchyData([]));

    const dateRange = (yield select((state: PluginRootState) => state.plugin.dateRange)) as ChangeFrequencyState['dateRange'];

    if (!dataConnection.commits?.getCommitDataWithFilesAndOwnership) {
      console.error('Required method getCommitDataWithFilesAndOwnership not found in dataConnection');
      yield put(setFileData([]));
      yield put(setHierarchyData([]));
      yield put(setLoading(false));
      return;
    }

    // from/to define the significant (visible) window, exactly like getAll(from, to). Data sources
    // may load a wider range for cumulative line counts and tag out-of-window commits isSignificant: false.
    const commits = (yield call(
      [dataConnection.commits, dataConnection.commits.getCommitDataWithFilesAndOwnership],
      dateRange.from,
      dateRange.to,
    )) as CommitWithFileChanges[];

    const fileData = Array.isArray(commits) && commits.length > 0 ? processCommits(commits) : [];
    yield put(setFileData(fileData));

    if (fileData.length === 0) {
      yield put(setHierarchyData([]));
      yield put(setLoading(false));
      return;
    }

    const currentPath = (yield select((state: PluginRootState) => state.plugin.currentPath)) as string;
    const level = getHierarchyLevel(fileData, currentPath);

    if (level === null) {
      // The previously navigated path no longer exists in the new data set -> reset to root
      // so the breadcrumb and the listed contents stay consistent.
      yield put(setNavigation({ currentPath: '', hierarchyStack: [] }));
      yield put(setHierarchyData(generateFullHierarchy(fileData)));
    } else {
      yield put(setHierarchyData(level));
    }

    yield put(setLoading(false));
  } catch (error) {
    console.error('Error in loadData:', error);
    yield put(setFileData([]));
    yield put(setHierarchyData([]));
    yield put(setLoading(false));
  }
}

// Recompute the displayed hierarchy level when the user navigates, without refetching.
function* handleNavigation() {
  const fileData = (yield select((state: PluginRootState) => state.plugin.fileData)) as FileChangeData[];
  const currentPath = (yield select((state: PluginRootState) => state.plugin.currentPath)) as string;
  const level = getHierarchyLevel(fileData, currentPath);
  yield put(setHierarchyData(level ?? generateFullHierarchy(fileData)));
}

export default function* root(dataConnection: DataPlugin) {
  yield fork(function* () {
    yield takeLatest('REFRESH', () => loadData(dataConnection));
  });
  yield fork(function* () {
    yield takeLatest(setDateRange.type, () => loadData(dataConnection));
  });
  yield fork(function* () {
    yield takeEvery(setNavigation.type, handleNavigation);
  });
}
