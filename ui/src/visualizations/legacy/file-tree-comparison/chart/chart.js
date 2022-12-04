'use strict';

import React from 'react';
import Tree from '../components/tree.js';

export default class Changes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      commitsToChoose1: [],
      commitsToChoose2: [],
      commits: this.props.commits,
      commit1: {
        messageHeader: 'Select a first commit',
      },
      commit2: {
        messageHeader: 'Select a second commit',
      },
      tree1: [],
      tree2: [],
    };
  }

  render() {
    return (
      <table>
        <thead>
          <th>
            <select
              value={this.state.commit1.messageHeader}
              onChange={(e) => {
                const commit = this.state.commits.find((c) => {
                  return e.target.options[e.target.options.selectedIndex].getAttribute('sha') === c.sha;
                });
                this.calculateValues(commit, null);
                this.setState({ commitsToChoose2: this.buildingSelect(this.state.commits, commit.date) });
              }}>
              {this.state.commitsToChoose1}
            </select>
          </th>
          <th>
            <select
              value={this.state.commit2.messageHeader}
              onChange={(e) => {
                const commit = this.state.commits.find((c) => {
                  return e.target.options[e.target.options.selectedIndex].getAttribute('sha') === c.sha;
                });
                this.calculateValues(null, commit);
              }}>
              {this.state.commitsToChoose2}
            </select>
          </th>
        </thead>
        <tbody>
          <td>
            <div>
              <Tree files={this.state.tree1} />
            </div>
          </td>
          <td>
            <div>
              <Tree files={this.state.tree2} />
            </div>
          </td>
        </tbody>
      </table>
    );
  }

  calculateValues(commit1, commit2) {
    if (commit1 !== null) {
      let tree1 = getTreeCommitspan(commit1.sha, this.state.commits);
      tree1 = makeHierarchyFileTree(tree1);
      this.setState({ commit1: commit1, tree1: tree1 });
    }
    if (commit2 !== null) {
      let tree2 = getTreeCommitspan(commit2.sha, this.state.commits);
      tree2 = makeHierarchyFileTree(tree2);
      this.setState({ commit2: commit2, tree2: tree2 });
    }
    if (this.state.commit1.messageHeader !== 'Select a first commit' && this.state.commit2.messageHeader !== 'Select a first commit') {
      //this.compareTrees
    }
  }

  buildingSelect(commits, filter) {
    let newCommits = [];
    if (filter === null) {
      for (const i in commits) {
        newCommits.push(
          <option key={i} sha={commits[i].sha}>
            {commits[i].messageHeader}
          </option>
        );
      }
    } else {
      for (const i in commits) {
        if (commits[i].date > filter) {
          newCommits.push(
            <option key={i} sha={commits[i].sha}>
              {commits[i].messageHeader}
            </option>
          );
        }
      }
    }
    newCommits = newCommits.slice().reverse(); //reverse Array
    console.log(newCommits);
    return newCommits;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.commits.length !== 0) {
      const commits = this.buildingSelect(nextProps.commits, null);
      this.setState({ commits: nextProps.commits, commitsToChoose1: commits, commitsToChoose2: commits });
    }
  }
}

function compareTrees(tree1, tree2) {
  tree2.forEach((e) => {
    if (tree1.contains(e)) {
      console.log('True');
    }
  });
}

function getTreeCommitspan(toSha, commits) {
  if (toSha === undefined || commits === undefined) {
    return null;
  }
  const fileTree = [];

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
