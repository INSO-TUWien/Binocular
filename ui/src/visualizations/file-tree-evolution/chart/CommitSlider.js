'use strict';

import React from 'react';

import styles from '../styles.scss';

export default class CommitSlider extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidUpdate() {
  }

  changeCommit(commit) {
    this.props.onSelectedCommitChange(commit)
  }

  render() {
    return (
      <div className={styles.commitSlider}>
        <label htmlFor="commits">Commits:</label>
        <input id="commits" type="range" min="0" max={this.props.commits.length} onChange={(e) => this.changeCommit(e.target.value)}></input>
        <span>{this.props.commits.length > this.props.selectedCommit ? this.props.commits[this.props.selectedCommit].message : ''}</span>
      </div>
    );
  }
}
