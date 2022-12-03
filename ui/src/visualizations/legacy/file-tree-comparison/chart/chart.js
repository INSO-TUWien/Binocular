'use strict';

import React from 'react';
import * as d3 from 'd3';

import styles from '../styles.scss';

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
      tree1: null,
      tree2: null,
    };
  }

  render() {
    return (
      <table className={styles.tableGeneral}>
        <thead>
          <tr className={styles.headerCommits}>
            <td>{this.state.commit1.messageHeader}</td>
            <td className={styles.tdLine}>{this.state.commit2.messageHeader}</td>
          </tr>
        </thead>
        <tbody>
          <tr className={styles.tableContent}>
            <td className={styles.tdLine}>Test 2</td>
            <td className={styles.tdLine}>Test3</td>
          </tr>
        </tbody>
      </table>
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.commit1 !== [] && nextProps.commit2 !== []) {
      let tree1 = getTreeCommitspan(null, nextProps.commit1.sha, nextProps.commits);
      tree1 = makeHierarchyFileTree(tree1);
      let tree2 = getTreeCommitspan(nextProps.commit1.sha, nextProps.commit2.sha, nextProps.commits);
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
