'use strict';
import React from 'react';
import Tree from '../components/tree.js';
import Select from 'react-select';
import styles from './chart.css';

export default class Changes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      commitsToChoose1: [],
      commitsToChoose2: [],
      commits: this.props.commits,
      tree1: [],
      tree2: [],
      commit1: {
        signature: '',
        date: '',
      },
      commit2: {
        signature: '',
        date: '',
      },
    };
  }

  render() {
    return (
      <table>
        <thead>
          <th>
            <div className={styles.flex}>
            <Select
              className={styles.select}
              placeholder={'Select first commit'}
              options={this.state.commitsToChoose1}
              onChange={(e) => {
                this.calculateValues(e.value, null);
                this.setState({ commitsToChoose2: this.buildingSelect(this.state.commits, e.value.date) });
              }}></Select> <div hidden={this.state.commit1.date === ''}>{this.state.commit1.signature.split('<')[0] + ', ' + this.state.commit1.date.substring(0, 10)}</div></div>
          </th>
          <th>
            <div className={styles.flex}>
            <Select
              className={styles.select}
              placeholder={'Select second commit'}
              options={this.state.commitsToChoose2}
              onChange={(e) => {
                this.calculateValues(null, e.value);
              }}></Select><div hidden={this.state.commit2.date === ''}>{this.state.commit2.signature.split('<')[0] + ', ' + this.state.commit2.date.substring(0, 10)}</div></div>
          </th>
        </thead>
        <tbody>
          <td>
            <div className={styles.padding}>
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
        newCommits.push({ label: commits[i].messageHeader, value: commits[i] });
      }
    } else {
      for (const i in commits) {
        if (commits[i].date > filter) {
          newCommits.push({ label: commits[i].messageHeader, value: commits[i] });
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
    const edited = getEdits(c1.sha, c2.sha, this.state.commits);

    tree1.forEach((path) => {
      if (!tree2.includes(path)) {
        markChild(tree1H, path, 'Deletion');
      }
    });
    this.setState({ tree1: tree1H });
    tree2.forEach((path) => {
      if (!tree1.includes(path)) {
        markChild(tree2H, path, 'Addition');
      }
    });
    edited.forEach((path) => {
      markChild(tree2H, path, 'Edit');
    });
    this.setState({ tree2: tree2H });
  }
}

function getEdits(fromSha, toSha, commits) {
  console.log('getEdits');
  const edited = [];

  const commitRadius = commits.slice(
    commits.findIndex((e) => e.sha === fromSha),
    commits.findIndex((e) => e.sha === toSha)
  );

  commitRadius.forEach((commit) => {
    commit.files.data.forEach((file) => {
      if (
        (file.stats.additions > 0 || file.stats.deletions > 0) &&
        file.lineCount !== file.stats.additions &&
        file.lineCount !== file.stats.deletions
      ) {
        edited.push(file.file.path);
      }
    });
  });
  return edited;
}
function getTreeCommitspan(toSha, commits) {
  console.log('getTreeCommitSpan');
  if (toSha === undefined || commits === undefined) {
    return null;
  }
  const fileTree = [];
  const commitRadius = commits.slice(0, commits.findIndex((e) => e.sha === toSha) + 1);

  commitRadius.forEach((commit) => {
    commit.files.data.forEach((f) => {
      if (f.stats.additions === f.lineCount) {
        if (!fileTree.includes(f.file.path)) {
          fileTree.push(f.file.path);
        }
      }
      if (f.stats.deletions === f.lineCount) {
        fileTree.splice(fileTree.indexOf(f.file.path), 1);
      }
    });
  });

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
