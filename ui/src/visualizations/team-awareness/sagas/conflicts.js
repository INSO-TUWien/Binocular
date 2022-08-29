import { put, select } from 'redux-saga/effects';
import { processTeamAwarenessConflicts } from '.';
import { getState } from '../util/util';

function* processConflictBranchSelection() {
  const appState = yield select();
  yield put(processTeamAwarenessConflicts(analyseConflictsFromAppState(appState)));
}

const analyseConflictsFromAppState = appState => {
  const { config, data } = getState(appState);

  if (config.selectedConflictBranch === 'not_set') {
    console.debug('no conflict branch set, returning...');
    return { conflicts: [] };
  }

  let eligibleFiles = [];

  data.data.files.forEach(f => {
    let inSelectedScope = false;
    f.commits.data.forEach(c => {
      inSelectedScope = inSelectedScope || config.selectedBranch === 'all' || config.selectedBranch === c.branch;

      if (c.branch == config.selectedConflictBranch && inSelectedScope) {
        eligibleFiles.push(f);
      }
    });
  });

  eligibleFiles = eligibleFiles.filter(f => !f.commits.data.every(c => c.branch.startsWith(config.selectedConflictBranch)));

  const test = fetch('http://github.com/INSO-TUWien/Binocular/blob/develop/ui/src/index.js', { mode: 'cors' });

  const result = Promise.all([test]);

  console.log(result);

  console.log('affected files', eligibleFiles);

  return { conflicts: [] };
};

export { processConflictBranchSelection };
