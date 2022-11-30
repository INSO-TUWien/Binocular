import { receiveTeamAwarenessFileConflictDetails } from './index';
import { put, select } from 'redux-saga/effects';
import { getState } from '../util/util';
import fetch from 'isomorphic-fetch';
import { Parser } from 'acorn';

const githubExpression = new RegExp('https?://github\\.com/');
const MyParser = Parser.extend(require('acorn-jsx')());

function* processFileConflictDetails() {
  const appState = yield select();
  yield put(receiveTeamAwarenessFileConflictDetails(yield analyseFileConflictDetails(appState)));
}

const analyseFileConflictDetails = async appState => {
  const { data: { data: { fileDetails } } } = getState(appState);

  const { selectedConflict: { files, selectedBranch, conflictBranch, selectedFile } } = fileDetails;
  const { file: file } = files.get(selectedFile);

  const blobIndex = file.url.indexOf('blob/');
  if (!githubExpression.test(file.url) || blobIndex === -1) {
    console.log('No tu wien binocular url');
    return {
      fileDetails: {
        selectedConflict: fileDetails.selectedConflict,
        fetchError: 'No Github file detected'
      }
    };
  }

  const repositoryUrl = file.url.substring(0, blobIndex);
  const githubContentUrl = repositoryUrl.replace('github.com', 'raw.githubusercontent.com');

  const results = await Promise.all([
    fetch(`${githubContentUrl}${conflictBranch}/${file.path}`, { mode: 'cors' }),
    fetch(`${githubContentUrl}${selectedBranch}/${file.path}`, { mode: 'cors' })
  ]);
  if (results.filter(response => response.status >= 400).length >= 1) {
    return {
      fileDetails: {
        selectedConflict: fileDetails.selectedConflict,
        fetchError: 'Could not fetch file details from Github'
      }
    };
  }
  const resultData = await Promise.all(results.map(r => r.text()));
  try {
    const trees = resultData.map(d => MyParser.parse(d, { ecmaVersion: 2020, sourceType: 'module', locations: true }));

    fileDetails.trees = trees;
  } catch (e) {
    fileDetails.parsingError = e;
    console.error(e);
  }

  // TODO: Process file details conflict
  //  Compare them
  //  Give feedback according to the AST data

  fileDetails.repositoryUrl = repositoryUrl + 'blob/';
  fileDetails.testData = resultData;
  return { fileDetails };
};

export { processFileConflictDetails };
