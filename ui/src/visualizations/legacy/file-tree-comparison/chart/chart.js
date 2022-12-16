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
    console.log('calculateValues ' + commit1 + commit2);
    if (commit1 !== null) {
      let tree1 = getTreeCommitspan(commit1.sha, this.state.commits);
      tree1 = makeHierarchyFileTree(tree1);
      this.setState(function (state) {
        if (state.tree2.length !== 0) {
          this.compareTrees(commit1, state.commit2);
        }
        return {
          commit1: commit1,
          tree1: tree1,
        };
      });
    }
    if (commit2 !== null) {
      let tree2 = getTreeCommitspan(commit2.sha, this.state.commits);
      tree2 = makeHierarchyFileTree(tree2);
      this.setState(function (state) {
        if (state.tree1.length !== 0) {
          this.compareTrees(state.commit1, commit2);
        }
        return {
          commit2: commit2,
          tree2: tree2,
        };
      });
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
    return newCommits;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.commits.length !== 0) {
      const commits = this.buildingSelect(nextProps.commits, null);
      this.setState({ commits: nextProps.commits, commitsToChoose1: commits, commitsToChoose2: commits });
    }
  }
  compareTrees(c1, c2) {
    console.log('compareTrees');
    const tree1 = getTreeCommitspan(c1.sha, this.state.commits);
    const tree2 = getTreeCommitspan(c2.sha, this.state.commits);
    let tree1H = makeHierarchyFileTree(tree1);
    let tree2H = makeHierarchyFileTree(tree2);

    tree1.forEach((path) => {
      if (!tree2.includes(path)) {
        console.log('Tree1 Deletion of ' + path);
        markChild(tree1H, path, 'Deletion');
      }
    });
    this.setState({ tree1: tree1H });
    tree2.forEach((path) => {
      if (!tree1.includes(path)) {
        markChild(tree2H, path, 'Addition');
      }
    });
    this.setState({ tree2: tree2H });
  }
}

function getTreeCommitspan(toSha, commits) {
  console.log('getTreeCommitSpan');
  if (toSha === undefined || commits === undefined) {
    return null;
  }
  const fileTree = [];

  for (let i = 0; i < commits.length; i++) {
    if (commits[i].sha !== toSha) {
      commits[i].files.data.forEach((f) => {
        if (f.stats.additions === f.lineCount) {
          if (!fileTree.includes(f.file.path)) {
            fileTree.push(f.file.path);
          }
        }
        if (f.stats.deletions > 0 && f.stats.additions === 0) {
          fileTree.splice(fileTree.indexOf(f.file.path), 1);
        }
      });
    } else {
      console.log(commits[i]);
      commits[i].files.data.forEach((f) => {
        if (f.stats.additions === f.lineCount) {
          if (!fileTree.includes(f.file.path)) {
            fileTree.push(f.file.path);
          }
        }
        if (f.stats.deletions > 0 && f.stats.additions === 0) {
          fileTree.splice(fileTree.indexOf(f.file.path), 1);
        }
      });
      console.log(fileTree);
      return fileTree;
    }
  }
  return fileTree;
}
function markChild(tree, path, mode) {
  if (path.includes('/')) {
    tree.forEach((n) => {
      if (n.name === path.split('/')[0]) {
        n.mark = mode;
        markChild(n.children, path.substring(path.indexOf('/') + 1, path.length), mode);
      }
    });
  } else {
    tree.map((n) => {
      if (n.name === path) {
        n.mark = mode;
        return tree;
      }
    });
  }
  return tree;
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
