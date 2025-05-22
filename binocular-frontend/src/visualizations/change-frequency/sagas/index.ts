import { all, takeEvery, select, put, fork, call } from '@redux-saga/core/effects';
import { createAction, Action } from 'redux-actions';
import _ from 'lodash';

import Database from '../../../database/database';
import { FileChangeData } from '../reducers/data';
import { ChangeFrequencyConfigState } from '../reducers/config';
import { 
  generateFullHierarchy, 
  getHierarchyForPath, 
  clearHierarchyCache
} from '../utils/hierarchy';

// Action creators
export const setChangeFrequencyConfig = createAction<Partial<ChangeFrequencyConfigState>>('SET_CHANGE_FREQUENCY_CONFIG');
export const setChangeFrequencyState = createAction('SET_CHANGE_FREQUENCY_STATE');
export const hierarchyDataStartLoading = createAction('HIERARCHY_DATA_START_LOADING');
export const hierarchyDataLoaded = createAction('HIERARCHY_DATA_LOADED');

interface Commit {
  sha?: string;
  date: string;
  signature?: string;
  files?: { data: any[] };
}

// Function to process the loaded commit data
// It creates a map for each path (file) and calculates the statistics based on each commit
// It loops through all the commits that we got from the database and for each commit it
// loops through all the files that were changed in that commit
function processCommits(commits: Commit[] = []) {
  const fileMap = new Map<string, FileChangeData>();
  
  for (const commit of commits) {
    if (!commit) continue;
    
    const files = commit.files?.data || []
    
    for (const file of files) {
      if (!file) continue;
      
      const filePath = file.file.path;
      if (!filePath) continue;
      
      const additions = file.stats.additions !== undefined ? Number(file.stats.additions) : 0;
      const deletions = file.stats.deletions !== undefined ? Number(file.stats.deletions) : 0;
      const lineCount = file.lineCount !== undefined ? Number(file.lineCount) : 0;
    
      // Creating a new entry for a file in the fileMap - happens when we find the file for the first time
      // Here is just the initialization of the entry - all the stats are set to 0 and updated later on
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
          owners: {}
        });
      }
      
      // Updating an entry for a file in the fileMap
      // Each time we find a file in commit, we update its stats
      const fileData = fileMap.get(filePath);
      if (fileData) {
        fileData.commitCount += 1;
        fileData.totalAdditions += additions;
        fileData.totalDeletions += deletions;
        fileData.totalChanges += (additions + deletions);
        
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
          fileData.owners[author].changes += (additions + deletions);
        }
        
        if (commit.sha && fileData.commits) {
          fileData.commits.push(commit.sha);
        }
      }
    };
  };
  
  return fileMap;
}

// Function to load all necessary data for the visualization
// It loads the neccessary commit data from the database
export function* loadData() {
  try {
    yield put(hierarchyDataStartLoading());
    
    let fileMap = new Map<string, FileChangeData>();
    
    try {
      // Getting the commit span from the config
      const state = (yield select()) as any;
      const config = state.visualizations.changeFrequency.state.config;
      
      // Getting the commit span from the config or using the default values
      const commitSpan = config?.commitSpan || [new Date(0), new Date()];
            
      const commits = yield Database.getCommitDataWithFilesAndOwnership(commitSpan, commitSpan);
      
      if (commits && commits.length > 0) {
        fileMap = processCommits(commits);
      }
    } catch (error) {
      console.error("Error loading commit data:", error);
    }
    
    if (fileMap.size === 0) {
      yield put(hierarchyDataLoaded([]));
      return;
    }
    
    // Rewriting the map to an array
    let fileData: FileChangeData[] = [];
    for (const file of fileMap.values()) {
      fileData.push({
        ...file,
        averageChangesPerCommit: file.commitCount > 0 ? (file.totalChanges) / file.commitCount : 0
      });
    }
        
    // Creating a hierarchy for the array of files
    const fullHierarchy = generateFullHierarchy(fileData);
    
    // Getting the current path from the state
    const state = (yield select()) as any;
    const currentPath = state.visualizations.changeFrequency.state.state.currentPath || '';
    
    let hierarchyData;
    if (!currentPath) {
      // For root path, use the full hierarchy
      hierarchyData = fullHierarchy;
    } else {
      // For specific path, get its children
      const node = getHierarchyForPath(currentPath);
      hierarchyData = node && node.children ? node.children : [];
    }
    
    yield put(hierarchyDataLoaded(hierarchyData));
    
  } catch (error) {
    console.error("Error in loadData:", error);
    yield put(hierarchyDataLoaded([]));
  }
}

// Generate hierarchy data when path changes
export function* watchForPathChanges() {
  yield takeEvery('SET_CHANGE_FREQUENCY_STATE', function* handlePathChange(action: Action<any>) {
    if (action.payload && (action.payload.currentPath !== undefined || action.payload.hierarchyStack !== undefined)) {
      let currentPath = '';
      if (action.payload.currentPath !== undefined) {
        currentPath = action.payload.currentPath;
      } else {
        const state = (yield select()) as any;
        currentPath = state.visualizations.changeFrequency.state.state.currentPath || '';
      }
      
      let hierarchyData;
      if (!currentPath) {
        const state = (yield select()) as any;
        const fileData = state.visualizations.changeFrequency.state.data.fileChangeData || [];
        hierarchyData = generateFullHierarchy(fileData);
      } else {
        const node = getHierarchyForPath(currentPath);
        hierarchyData = node && node.children ? node.children : [];
      }
      
      yield put(hierarchyDataLoaded(hierarchyData));
    }
  });
}

export function* watchForConfigChanges() {
  yield takeEvery('SET_CHANGE_FREQUENCY_CONFIG', function* handleConfigChange() {
    clearHierarchyCache();
    yield call(loadData);
  });
}

export default function* root() {
  yield all([
    fork(watchForConfigChanges),
    fork(watchForPathChanges),
    loadData(),
  ]);
} 