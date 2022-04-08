'use strict';

import React from 'react';

import _ from 'lodash';

import Sunburst from './Sunburst';
import CommitSlider from './CommitSlider';
import styles from '../styles.scss';

export default class FileTreeEvolution extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      fileTreeHistory: nextProps.fileTreeHistory,
      commits: nextProps.commits,
    });
  }

  changeSelectedCommit(commit) {
    this.setState({
      selectedCommit: commit
    });
  }

  render() {
    return (
      <div>
        <div className={styles.mainContainer}>
          <CommitSlider 
            commits={this.props.commits || []}
            selectedCommit={this.state.selectedCommit || 0}
            onSelectedCommitChange={commit => this.changeSelectedCommit(commit)} />
          <Sunburst fileTreeHistory={this.props.fileTreeHistory} selectedCommit={this.state.selectedCommit} />
        </div>
      </div>
    );
  }
}
