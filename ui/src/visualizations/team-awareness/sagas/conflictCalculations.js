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
    return { conflicts: [] };
  }

  const changedFiles = extractChangedFiles(data.data.files, config);
  const stakeholders = new Map();

  for (const file of changedFiles) {
    const aggregatedChanges = aggregateChanges(await getFileHunks(file.path), config);

    if (!aggregatedChanges.has(config.selectedConflictBranch)) {
      console.log('could not find files for selection', config.selectedConflictBranch, config.selectedBranch);
      return { conflicts: [] };
    }

    for (const branch of aggregatedChanges.keys()) {
      if (branch === config.selectedConflictBranch) continue;
      const conflictingContributor = aggregatedChanges.get(config.selectedConflictBranch).contributors;
      const conflictingStakeholders = checkBranchConflicts(conflictingContributor, aggregatedChanges.get(branch).contributors);
      if (conflictingStakeholders.length === 0) continue;

      for (const s of conflictingStakeholders) {
        const { conflictStakeholder, otherStakeholder, hunks, changes } = s;

        const combined = `${conflictStakeholder.stakeholder.id}${otherStakeholder.stakeholder.id}`;
        if (!stakeholders.has(combined)) {
          stakeholders.set(combined, {
            conflictStakeholder: conflictStakeholder.stakeholder,
            otherStakeholder: otherStakeholder.stakeholder,
            conflictBranch: config.selectedConflictBranch,
            files: new Map()
          });
        }

        if (!stakeholders.get(combined).files.has(file.path)) {
          stakeholders.get(combined).files.set(file.path, {
            file: { path: file.path, url: file.webUrl },
            branches: [],
            changes: new Map()
          });
        }
        stakeholders.get(combined).files.get(file.path).branches.push(branch);
        stakeholders.get(combined).files.get(file.path).changes.set(branch, {
          branch: branch,
          conflicting: changes.conflicting,
          other: changes.other
        });
      }
    }
  }

  return {
    conflicts: Array.from(stakeholders.values())
  };
};

const extractChangedFiles = (files, config) => {
  const skipFilesRegex = new RegExp(/^.*(package-lock.json|yarn.lock)$/);

  const eligibleFiles = new Map();
  files.forEach(f => {
    if (skipFilesRegex.test(f.path) === false) {
      for (const c of f.commits.data) {
        if (c.branch.startsWith(config.selectedConflictBranch) && !eligibleFiles.has(f.path)) {
          eligibleFiles.set(f.path, f);
        }
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

const checkBranchConflicts = (conflictBranchContributors, otherContributors) => {
  const detectedBranchConflicts = [];
  for (const conflictContributor of conflictBranchContributors) {
    for (const otherContributor of otherContributors) {
      const conflictingChanges = checkContributorConflict(conflictContributor, otherContributor);
      if (conflictingChanges.conflicting.length > 0) {
        detectedBranchConflicts.push({
          conflictStakeholder: conflictContributor,
          otherStakeholder: otherContributor,
          changes: conflictingChanges
        });
      }
    }
  }
  return detectedBranchConflicts;
};

const checkContributorConflict = (conflictContributor, otherContributor) => {
  const conflictChanges = [];
  const otherChanges = [];

  for (const conflictHunk of conflictContributor.hunks) {
    for (const otherHunk of otherContributor.hunks) {
      const changes = checkHunkConflict(conflictHunk, otherHunk);
      if (changes.conflictingChanges.length > 0 || changes.otherChanges.length > 0) {
        conflictChanges.push(...changes.conflictingChanges);
        otherChanges.push(...changes.otherChanges);
      }
    }
  }

  return {
    conflicting: conflictChanges,
    other: otherChanges
  };
};

const checkHunkConflict = (conflictHunk, otherHunk) => {
  const conflictingHunks = new Set();
  const otherHunks = new Set();

  for (const conflictChanges of conflictHunk) {
    for (const otherChanges of otherHunk) {
      if (conflictChanges.newStart < otherChanges.oldStart || conflictChanges.newStart > otherChanges.oldStart + otherChanges.oldLines) {
        continue;
      }
      if (otherChanges.newStart < conflictChanges.oldStart && otherChanges.newStart > conflictChanges.oldStart + conflictChanges.oldLines) {
        continue;
      }

      conflictingHunks.add(conflictChanges);
      otherHunks.add(otherChanges);
    }
  }
  return {
    conflictingChanges: Array.from(conflictingHunks),
    otherChanges: Array.from(otherHunks)
  };
};

export { processConflictBranchSelection };
