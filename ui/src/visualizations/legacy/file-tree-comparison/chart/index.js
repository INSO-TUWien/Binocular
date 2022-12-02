'use strict';

import { connect } from 'react-redux';
import Chart from './chart.js';
import { setTree1, setTree2 } from '../sagas';

const mapStateToProps = (state /*, ownProps*/) => {
  const corState = state.visualizations.fileTreeComparison.state;
  let treeOne = getTreeCommitspan(null, corState.config.commit1.sha, corState.data.data.commits);
  treeOne = makeHierarchyFileTree(treeOne);
  setTree1(treeOne);
  console.log(treeOne);

  let treeTwo = getTreeCommitspan(corState.config.commit1.sha, corState.config.commit2.sha, corState.data.data.commits);
  treeTwo = makeHierarchyFileTree(treeTwo);
  setTree2(treeTwo);
  console.log(treeTwo);
  return {
    commits: corState.data.data.commits,
  };
};

function getTreeCommitspan(fromSha, toSha, commits) {
  if (toSha === undefined || fromSha === undefined || commits === undefined) {
    return null;
  }
  const fileTree = [];
  if (fromSha === null) {
    commits.forEach((c) => {
      if (c.sha === toSha) {
        return fileTree;
      }
      c.files.data.forEach((f) => {
        fileTree.push(f.file.path);
      });
    });
  } else {
    let mark = 0;
    commits.forEach((c) => {
      if (c.sha === fromSha) {
        mark = 1;
      }
      if (c.sha === toSha) {
        return fileTree;
      }
      if (mark === 1) {
        c.files.data.forEach((f) => {
          fileTree.push(f.file.path);
        });
      }
    });
  }
  return fileTree;
}

function makeHierarchyFileTree(fileTree) {
  if (fileTree === null || fileTree === undefined) {
    return null;
  }
  const result = [];
  const level = { result };

  fileTree.forEach((entry) => {
    entry.split('/').reduce((r, name) => {
      if (!r[name]) {
        r[name] = { result: [] };
        r.result.push({ name, children: r[name].result });
      }
      return r[name];
    }, level);
  });

  return result;
}

export default connect(mapStateToProps)(Chart);
