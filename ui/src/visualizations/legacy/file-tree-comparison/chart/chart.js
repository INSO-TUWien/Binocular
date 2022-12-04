'use strict';

import React from 'react';
import Tree from '../components/tree.js';

export default class Changes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      commits: this.props.commits,
      commit1: {
        messageHeader: '',
      },
      commit2: {
        messageHeader: '',
      },
      tree1: [],
      tree2: [],
    };
  }

  render() {
    return (
      <Tree files={this.state.tree1} />
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.commit1 !== [] && nextProps.commit2 !== []) {
      let tree1 = getTreeCommitspan(nextProps.commit1.sha, nextProps.commits);
      tree1 = makeHierarchyFileTree(tree1);
      let tree2 = getTreeCommitspan(nextProps.commit2.sha, nextProps.commits);
      tree2 = makeHierarchyFileTree(tree2);
      this.setState({
        commits: nextProps.commits,
        commit1: nextProps.commit1,
        commit2: nextProps.commit2,
        tree1: tree1,
        tree2: tree2,
      });
    }
  }
}

function getTreeCommitspan(toSha, commits) {
  if (toSha === undefined || commits === undefined) {
    return null;
  }
  const fileTree = [];
  console.log(commits);
  console.log(toSha);

  for (let i = 0; i < commits.length; i++) {
    if (commits[i].sha !== toSha) {
      commits[i].files.data.forEach((f) => {
        fileTree.push(f.file.path);
      });
    } else {
      return fileTree;
    }
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
