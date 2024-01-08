'use strict';

import styles from './progress-bar.module.scss';
import React from 'react';

export default class ProgressBar extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      commits: props.progress.commits,
      issues: props.progress.issues,
      builds: props.progress.builds,
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
      files: nextProps.progress.files,
      mergeRequests: nextProps.progress.mergeRequests,
      modules: nextProps.progress.modules,
    });
  }

  render() {
    const pieData = [this.state.commits, this.state.issues, this.state.builds];

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
          <svg className={styles.statusBar} viewBox="0 0 855 300">
            {pieData[0].total !== 0 ? (
              <g>
                <path
                  id={'pathCommits'}
                  className={styles.path}
                  d={'M 25 125 L 855 125 A 1 1 0 0 0 855 25 A 1 1 0 0 0 855 125 A 1 1 0 0 0 855 25'}
                  stroke={colors[0]}
                  strokeWidth={'15'}
                  fill={'transparent'}
                  strokeDasharray={
                    Math.max(
                      ((pathWidth * (this.state.hover ? widthExtended : widthCompressed)) / 3 / pieData[0].total) * pieData[0].processed -
                        separatorWidth,
                      0,
                    ) + ' 10000'
                  }
                  strokeDashoffset={'-' + pathWidth * (this.state.hover ? offsetExtended : offsetCompressed)}
                  strokeLinecap={'round'}
                />
                <path d={'M 35 125 L 35 200'} stroke={colors[0]} strokeWidth={'5'} />
                <text x={50} y={200} fontSize={50} fill={colors[0]}>
                  Commits
                </text>
              </g>
            ) : (
              ''
            )}
            {pieData[1].total !== 0 ? (
              <g>
                <path
                  id={'pathIssues'}
                  className={styles.path}
                  d={'M 25 125 L 855 125 A 1 1 0 0 0 855 25 A 1 1 0 0 0 855 125 A 1 1 0 0 0 855 25'}
                  stroke={colors[1]}
                  strokeWidth={'15'}
                  fill={'transparent'}
                  strokeDasharray={
                    Math.max(
                      ((pathWidth * (this.state.hover ? widthExtended : widthCompressed)) / 3 / pieData[1].total) * pieData[1].processed -
                        separatorWidth,
                      0,
                    ) + ' 10000'
                  }
                  strokeDashoffset={
                    '-' +
                    pathWidth *
                      ((this.state.hover ? offsetExtended : offsetCompressed) + (this.state.hover ? widthExtended : widthCompressed) / 3)
                  }
                  strokeLinecap={'round'}
                />
                <path d={'M 295 125 L 295 200'} stroke={colors[1]} strokeWidth={'5'} />
                <text x={310} y={200} fontSize={50} fill={colors[1]}>
                  Issues
                </text>
              </g>
            ) : (
              ''
            )}
            {pieData[2].total !== 0 ? (
              <g>
                <path
                  id={'pathBuilds'}
                  className={styles.path}
                  d={'M 25 125 L 855 125 A 1 1 0 0 0 855 25 A 1 1 0 0 0 855 125 A 1 1 0 0 0 855 25'}
                  stroke={colors[2]}
                  strokeWidth={'15'}
                  fill={'transparent'}
                  strokeDasharray={
                    Math.max(
                      ((pathWidth * (this.state.hover ? widthExtended : widthCompressed)) / 3 / pieData[2].total) * pieData[2].processed -
                        separatorWidth,
                      0,
                    ) + ' 10000'
                  }
                  strokeDashoffset={
                    '-' +
                    pathWidth *
                      ((this.state.hover ? offsetExtended : offsetCompressed) +
                        ((this.state.hover ? widthExtended : widthCompressed) / 3) * 2)
                  }
                  strokeLinecap={'round'}
                />
                <path d={'M 555 125 L 555 200'} stroke={colors[2]} strokeWidth={'5'} />
                <text x={570} y={200} fontSize={50} fill={colors[2]}>
                  Builds
                </text>
              </g>
            ) : (
              ''
            )}
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
            <hr style={{ margin: '0.5rem 0' }} />
            <div>Files: {this.state.files.total}</div>
            <div>Modules: {this.state.modules.total}</div>
            <div>
              Merge Requests: {this.state.mergeRequests.processed}/{this.state.mergeRequests.total} (
              {Math.round((100 / this.state.mergeRequests.total) * this.state.mergeRequests.processed)}%)
            </div>
          </div>
        </div>
      </div>
    );
  }
}
