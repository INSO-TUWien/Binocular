import { put, select } from 'redux-saga/effects';
import { receiveTeamAwarenessConflicts, startTeamAwarenessConflictProcessing } from '.';
import { getState } from '../util/util';
import { getFileHunks } from './getFilesHunks';

function* processConflictBranchSelection() {
  const appState = yield select();
  yield put(startTeamAwarenessConflictProcessing());
  yield put(receiveTeamAwarenessConflicts(yield analyseConflictsFromAppState(appState)));
}

const analyseConflictsFromAppState = async appState => {
  const { config, data } = getState(appState);

  if (config.selectedConflictBranch === 'not_set' || config.selectedConflictBranch === config.selectedBranch) {
    console.debug('nothing to do');
    return { conflicts: null };
  }

  const eligibleFiles = extractEligibleFiles(data.data.files, config);
  const conflicts = new Map();

  for (const file of eligibleFiles) {
    const aggregatedChanges = aggregateChanges(await getFileHunks(file.path), config);

    if (!aggregatedChanges.has(config.selectedConflictBranch)) {
      console.log('could not find files for selection', config.selectedConflictBranch, config.selectedBranch);
      return { conflicts: [] };
    }

    for (const selectedContributor of aggregatedChanges.get(config.selectedConflictBranch).contributors) {
      let selectedContributorConflicted = false;

      for (const possibleConflict of selectedContributor.hunks) {
        for (const change of possibleConflict) {
          const detectedConflicts = checkForConflicts(
            change,
            selectedContributor.stakeholder,
            config.selectedConflictBranch,
            aggregatedChanges.values()
          );

          if (detectedConflicts.length > 0) {
            if (!conflicts.has(file.path)) {
              conflicts.set(file.path, { file: file.path, data: [] });
            }
            conflicts.get(file.path).data.push(...detectedConflicts);
            selectedContributorConflicted = true;
            break;
          }
        }
        if (selectedContributorConflicted === true) break;
      }
    }
  }
  return { conflicts: Array.from(conflicts.values()) };
};

const extractEligibleFiles = (files, config) => {
  const eligibleFiles = new Map();
  files.forEach(f => {
    for (const c of f.commits.data) {
      if (c.branch.startsWith(config.selectedConflictBranch) && !eligibleFiles.has(f.path)) {
        eligibleFiles.set(f.path, f);
      }
    }
  });

  if (config.selectedBranch === 'all') return Array.from(eligibleFiles.values());

  for (const fileKey of eligibleFiles.keys()) {
    if (!eligibleFiles.get(fileKey).commits.data.some(c => c.branch.startsWith(config.selectedBranch))) {
      eligibleFiles.delete(fileKey);
    }
  }

  return Array.from(eligibleFiles.values());
};

const aggregateChanges = (data, config) => {
  const hunksByBranch = new Map();

  for (const commit of data.file.commits.data) {
    if (
      config.selectedBranch !== 'all' &&
      commit.branch.startsWith(config.selectedBranch) === false &&
      commit.branch.startsWith(config.selectedConflictBranch) === false
    ) {
      continue;
    }

    if (!hunksByBranch.has(commit.branch)) {
      hunksByBranch.set(commit.branch, { branch: commit.branch, contributors: new Map() });
    }

    if (!hunksByBranch.get(commit.branch).contributors.has(commit.stakeholder.id)) {
      hunksByBranch.get(commit.branch).contributors.set(commit.stakeholder.id, { stakeholder: commit.stakeholder, hunks: [] });
    }

    hunksByBranch.get(commit.branch).contributors.get(commit.stakeholder.id).hunks.push(commit.file.hunks);
  }

  hunksByBranch.forEach(h => (h.contributors = Array.from(h.contributors.values())));
  return hunksByBranch;
};

const checkForConflicts = (sourceChange, conflictStakeholder, conflictBranch, otherEdits) => {
  const conflicts = new Map();

  for (const otherEdit of otherEdits) {
    if (otherEdit.branch === conflictBranch) continue;

    for (const otherContributor of otherEdit.contributors) {
      let contributorConflicted = false;

      for (const otherHunk of otherContributor.hunks) {
        for (const otherChange of otherHunk) {
          if (sourceChange.oldStart >= otherChange.newStart) {
            contributorConflicted = true;

            if (!conflicts.has(otherEdit.branch)) {
              conflicts.set(otherEdit.branch, { branch: otherEdit.branch, conflicts: [] });
            }
            conflicts.get(otherEdit.branch).conflicts.push({
              conflictStakeholder: conflictStakeholder,
              otherStakeholder: otherContributor.stakeholder,
              change: otherChange
            });
            break;
          }
        }
        if (contributorConflicted === true) break;
      }
    }
  }
  return Array.from(conflicts.values());
};

export { processConflictBranchSelection };
