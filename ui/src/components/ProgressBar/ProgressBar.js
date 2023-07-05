'use strict';

import cx from 'classnames';

import styles from './progress-bar.scss';
import React from 'react';

export default class ProgressBar extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      commits: props.progress.commits,
      issues: props.progress.issues,
      builds: props.progress.builds,
      languages: props.progress.languages,
      files: props.progress.files,
      mergeRequests: props.progress.mergeRequests,
      modules: props.progress.modules,
      hover: false,
    };
  }
  componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      commits: nextProps.progress.commits,
      issues: nextProps.progress.issues,
      builds: nextProps.progress.builds,
      languages: nextProps.progress.languages,
      files: nextProps.progress.files,
      mergeRequests: nextProps.progress.mergeRequests,
      modules: nextProps.progress.modules,
    });
  }

  render() {
    const pieData = [this.state.commits, this.state.issues, this.state.builds, this.state.languages];

    const colors = ['#006ee6', '#0055b3', '#003d80', '#003166'];
    const pathWidth = 825 + 100 * Math.PI * 1.5; //width of whole path in px
    const offsetCompressed = 0.77; //in percent
    const offsetExtended = 0; //in percent
    const widthCompressed = 0.24; //in percent
    const widthExtended = 0.6; //in percent
    const separatorWidth = 20; //in px

    if (this.props.offlineMode) return null;
    return (
      <div
        className={styles.hoverTarget}
        onMouseOver={() => this.setState({ hover: true })}
        onMouseLeave={() => this.setState({ hover: false })}>
        <div className={styles.progressBoxInner}>
          <h1 className={styles.headline}>Indexing Progress:</h1>
          <svg className={styles.statusBar} viewBox="0 0 855 150">
            <path
              id={'pathCommits'}
              className={styles.path}
              d="M 25 125 L 855 125 A 1 1 0 0 0 855 25 A 1 1 0 0 0 855 125 A 1 1 0 0 0 855 25"
              stroke={colors[0]}
              strokeWidth={'15'}
              fill={'transparent'}
              strokeDasharray={
                Math.max(
                  ((pathWidth * (this.state.hover ? widthExtended : widthCompressed)) / 3 / pieData[0].total) * pieData[0].processed -
                    separatorWidth,
                  0
                ) + ' 10000'
              }
              strokeDashoffset={'-' + pathWidth * (this.state.hover ? offsetExtended : offsetCompressed)}
              strokeLinecap={'round'}
            />
            <path
              id={'pathIssues'}
              className={styles.path}
              d="M 25 125 L 855 125 A 1 1 0 0 0 855 25 A 1 1 0 0 0 855 125 A 1 1 0 0 0 855 25"
              stroke={colors[1]}
              strokeWidth={'15'}
              fill={'transparent'}
              strokeDasharray={
                Math.max(
                  ((pathWidth * (this.state.hover ? widthExtended : widthCompressed)) / 3 / pieData[1].total) * pieData[1].processed -
                    separatorWidth,
                  0
                ) + ' 10000'
              }
              strokeDashoffset={
                '-' +
                pathWidth *
                  ((this.state.hover ? offsetExtended : offsetCompressed) + (this.state.hover ? widthExtended : widthCompressed) / 3)
              }
              strokeLinecap={'round'}
            />
            <path
              id={'pathBuilds'}
              className={styles.path}
              d="M 25 125 L 855 125 A 1 1 0 0 0 855 25 A 1 1 0 0 0 855 125 A 1 1 0 0 0 855 25"
              stroke={colors[2]}
              strokeWidth={'15'}
              fill={'transparent'}
              strokeDasharray={
                Math.max(
                  ((pathWidth * (this.state.hover ? widthExtended : widthCompressed)) / 3 / pieData[2].total) * pieData[2].processed -
                    separatorWidth,
                  0
                ) + ' 10000'
              }
              strokeDashoffset={
                '-' +
                pathWidth *
                  ((this.state.hover ? offsetExtended : offsetCompressed) + ((this.state.hover ? widthExtended : widthCompressed) / 3) * 2)
              }
              strokeLinecap={'round'}
            />
          </svg>
          {this.props.showWorkIndicator ? (
            <svg className={styles.loadingAnimation} viewBox="0 0 150 150">
              <path
                d="M 62.5 125 A 1 1 0 0 0 62.5 25 A 1 1 0 0 0 62.5 125 Z"
                strokeWidth={'15'}
                fill={'transparent'}
                strokeLinecap={'round'}
              />
            </svg>
          ) : (
            ''
          )}
          <div className={styles.progressInfo}>
            <div>
              Commits: {pieData[0].processed}/{pieData[0].total} ({Math.round((100 / pieData[0].total) * pieData[0].processed)}%)
            </div>
            <div>
              Issues: {pieData[1].processed}/{pieData[1].total} ({Math.round((100 / pieData[1].total) * pieData[1].processed)}%)
            </div>
            <div>
              Builds: {pieData[2].processed}/{pieData[2].total} ({Math.round((100 / pieData[2].total) * pieData[2].processed)}%)
            </div>
            <div>
              Languages: {pieData[3].processed}/{pieData[3].total} ({Math.round((100 / pieData[3].total) * pieData[3].processed)}%)
            </div>
            <div>
              Files: {this.state.files.processed}/{this.state.files.total} (
              {Math.round((100 / this.state.files.total) * this.state.files.processed)}%)
            </div>
            <div>
              Merge Requests: {this.state.mergeRequests.processed}/{this.state.mergeRequests.total} (
              {Math.round((100 / this.state.mergeRequests.total) * this.state.mergeRequests.processed)}%)
            </div>{' '}
            <div>
              Modules: {this.state.modules.processed}/{this.state.modules.total} (
              {Math.round((100 / this.state.modules.total) * this.state.modules.processed)}%)
            </div>
          </div>
        </div>
      </div>
    );
  }
}
