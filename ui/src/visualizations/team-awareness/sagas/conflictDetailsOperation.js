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
  const { file, changes } = files.get(selectedFile);
  console.log(fileDetails.selectedConflict.selectedFile, selectedFile, files.get(selectedFile));
  const blobIndex = file.url.indexOf('blob/');
  if (!githubExpression.test(file.url) || blobIndex === -1) {
    console.log('Only GitHub content supported');
    return {
      fileDetails: {
        selectedConflict: fileDetails.selectedConflict,
        error: 'No Github file detected'
      }
    };
  }

  const repositoryUrl = file.url.substring(0, blobIndex);
  const githubContentUrl = repositoryUrl.replace('github.com', 'raw.githubusercontent.com');

  const results = await Promise.all([fetch(`${githubContentUrl}${conflictBranch}/${file.path}`, { mode: 'cors' })]);
  if (results.filter(response => response.status >= 400).length >= 1) {
    return {
      fileDetails: {
        selectedConflict: fileDetails.selectedConflict,
        error: 'Could not fetch files from Github'
      }
    };
  }
  const resultData = await Promise.all(results.map(r => r.text()));
  try {
    const trees = resultData.map(d => MyParser.parse(d, { ecmaVersion: 2020, sourceType: 'module', locations: true }));

    const changeDescriptions = [];
    for (const changedNode of getChangedAstNodes(trees[0], changes, selectedBranch)) {
      changeDescriptions.push({
        type: splitPascalCase(changedNode.type).reduce((a, b) => `${a} ${b}`),
        start: changedNode.loc.start.line,
        end: changedNode.loc.end.line
      });
    }

    fileDetails.changes = changeDescriptions;
  } catch (e) {
    fileDetails.error = e;
  }
  fileDetails.repositoryUrl = repositoryUrl + 'blob/';
  return { fileDetails };
};

const splitPascalCase = text => {
  const result = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === text[i].toUpperCase()) {
      result.push(text[i]);
    } else {
      if (result.length > 0) {
        result[result.length - 1] += text[i];
      } else {
        result.push(text[i]);
      }
    }
  }
  return result;
};

function getChangedAstNodes(ast, changes, selectedBranch) {
  const changedNodes = [];

  for (const node of ast.body) {
    for (const change of changes.get(selectedBranch).other) {
      if (node.loc.end.line < change.newStart && node.loc.end.line < change.oldStart) {
        continue;
      }
      if (node.loc.start.line > change.newStart + change.newLines && node.loc.start.line > change.oldStart + change.oldLines) {
        continue;
      }
      changedNodes.push(node);
      break;
    }
  }

  return changedNodes;
}

export { processFileConflictDetails };
