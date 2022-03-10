'use strict';

import React from 'react';
import * as d3 from 'd3';

import styles from '../styles.scss';
import ReactDOM from 'react-dom';

export default class FileEvolution extends React.Component {
  constructor(props) {
    super(props);
  }
  componentWillReceiveProps(nextProps) {}

  componentDidMount() {}

  render() {
    const space = 100;

    const drawCommitBoxSortByDate = this.getCommitBoxDate(space);
    const drawCommitBoxSortByBranch = this.getCommitBoxForAllBranches(space);
    let chart = drawCommitBoxSortByDate;
    if (this.props.commitBoxSort === 'branch') {
      chart = drawCommitBoxSortByBranch;
    }
    return (
      <div className={styles.chartContainer}>
        <div className={styles.chartLine}>
          {chart}
        </div>
      </div>
    );
  }

  getCommitBoxDate(space) {
    const commitBoxes = this.getCommitsDrawDate(space);
    return (
      <div className={styles.chartLine}>
        <h2>Commits sorted by Date</h2>
        {commitBoxes}
      </div>
    );
  }

  getCommitsDrawDate(space) {
    function getBoxColor(props, commit) {
      let color = 'red';
      if (props.commitBoxColor === 'author') {
        color = props.authorsColorPalette[commit.signature];
      } else if (props.commitBoxColor === 'branch') {
        color = props.branchesColorPalette[getBranch(props, commit)];
        if (color === undefined) {
          color = 'red';
        }
      }
      return color;
    }

    function getBranch(props, commit) {
      let branch = '';
      for (const b in props.branches) {
        const branchName = props.branches[b].branch;
        if (commit.branch.includes(branchName)) {
          branch = branchName;
          break;
        }
      }
      return branch;
    }

    function getCommitInfo(props, commit) {
      //TODO font size
      const commitInfo = [];

      commitInfo.push(
        <h1>
          <b>Commit</b>
          <br />
          {commit.messageHeader}
        </h1>
      );
      commitInfo.push(<hr />);
      if (props.showCommitMessage) {
        commitInfo.push(
          <text fontSize="smaller">
            <b>Message:</b> {commit.message}
          </text>
        );
        commitInfo.push(<br />);
      }
      if (props.showCommitSha === 'short') {
        commitInfo.push(
          <text fontSize="smaller">
            <b>Short SHA:</b> {commit.shortSha}
          </text>
        );
        commitInfo.push(<br />);
      } else if (props.showCommitSha === 'all') {
        commitInfo.push(
          <text fontSize="smaller">
            <b>SHA:</b> {commit.sha}
          </text>
        );
        commitInfo.push(<br />);
      }
      if (props.showCommitDate) {
        commitInfo.push(
          <text fontSize="smaller">
            <b>Date:</b> {commit.date}
          </text>
        );
        commitInfo.push(<br />);
      }
      if (props.showCommitAuthor) {
        commitInfo.push(
          <text fontSize="smaller">
            <b>Author:</b> {commit.signature}
          </text>
        );
        commitInfo.push(<br />);
      }
      if (props.showCommitBranch) {
        commitInfo.push(
          <text fontSize="smaller">
            <b>Branch:</b> {getBranch(props, commit)}
          </text>
        );
        commitInfo.push(<br />);
      }
      if (props.showCommitWeblink) {
        commitInfo.push(
          <a href={commit.webUrl}>
            <text fontSize="smaller">
              <b>URL:</b> {commit.webUrl}
            </text>
          </a>
        );
        commitInfo.push(<br />);
      }
      if (props.showCommitFiles) {
        commitInfo.push(
          <text fontSize="smaller">
            <b>Files:</b>
          </text>
        );
        commitInfo.push(<br />);
        const files = props.commitFiles[commit.sha];
        for (const f in files) {
          const file = files[f];
          commitInfo.push(
            <a href={file.webUrl}>
              <text fontSize="smaller">
                {file.path}
              </text>
            </a>
          );
          commitInfo.push(<br />);
        }
      }
      return commitInfo;
    }

    function getArrow(x, y, height, width, color) {
      //TODO Arrow
      const arrow = [];

      const lineXstart = x + width + 5;
      const lineY = y + height / 2;
      const lineXend = x + width + space - 5;
      const pointsForLine = '' + lineXstart.toString() + ',' + lineY.toString() + ' ' + lineXend.toString() + ',' + lineY.toString();

      const arrowHeadYup = y + height / 4;
      const arrowHeadYdown = y + height / 4 * 3;
      const arrowHeadX = lineXstart + (lineXend - lineXstart) / 4 * 3;
      const pointsForArrowHead =
        '' +
        arrowHeadX.toString() +
        ',' +
        arrowHeadYup.toString() +
        ' ' +
        lineXend.toString() +
        ',' +
        lineY.toString() +
        ' ' +
        arrowHeadX.toString() +
        ',' +
        arrowHeadYdown.toString() +
        ' ' +
        arrowHeadX.toString() +
        ',' +
        arrowHeadYup.toString();

      arrow.push(<rect x={lineXstart} y={lineY - height / 16} width={arrowHeadX - lineXstart} height={height / 8} fill={color} />);
      arrow.push(<polyline points={pointsForArrowHead} fill={color} stroke={color} />);
      return arrow;
    }


    const commitData = this.props.commits;
    const width = this.props.commitBoxWidth;
    const height = this.props.commitBoxHeight;
    const commitRects = [];
    const xStart = 20;
    let x = xStart;
    const y = 10;

    for (const i in commitData) {
      const commit = commitData[i];

      if (this.props.selectedAuthors.indexOf(commit.signature) > -1) {
        if (this.props.selectedBranches.indexOf(getBranch(this.props, commit)) > -1) {
          const color = getBoxColor(this.props, commit);
          if (x !== xStart) {
            commitRects.push(
              <g width={space} height={height}>
                {getArrow(x - width - space, y, height, width, '#000000')}
              </g>
            );
          }
          commitRects.push(
            <g width={width} height={height}>
              <rect x={x} y={y} width={width} height={height} fill={color} />
              <foreignObject x={x} y={y} width={width} height={height} class="commitInfo">
                {getCommitInfo(this.props, commit)}
              </foreignObject>
            </g>
          );

          x = x + width + space;
          //y = y + height + space; //TODO auskommentieren
        }
      } //selected Branches
    } //selected Authors

    //commitRects.pop(); //remove last arrow
    const svgWidth = (commitRects.length / 2 + 1) * this.props.commitBoxWidth + commitRects.length / 2 * space;
    const svgHeight = this.props.commitBoxHeight + space * 2;

    return (
      <svg
        style={{
          height: svgHeight,
          width: svgWidth
        }}>
        {commitRects}
      </svg>
    );
  }

  getCommitBoxForAllBranches(space) {
    const branchgraph = [];

    for (const b in this.props.branches) {
      const branchName = this.props.branches[b].branch;
      if (this.props.selectedBranches.indexOf(branchName) > -1) {
        branchgraph.push(this.getCommitBoxBranch(space, branchName));
      }
    }
    return branchgraph;
  }

  getCommitBoxBranch(space, branch) {
    const commitBoxes = this.getCommitsDrawBranch(space, branch);
    return (
      <div className={styles.branchChart}>
        <h2>
          Branch: {branch}
        </h2>
        {commitBoxes}
      </div>
    );
  }

  getCommitsDrawBranch(space, branch) {
    function getBoxColor(props, commit) {
      let color = 'red';
      if (props.commitBoxColor === 'author') {
        color = props.authorsColorPalette[commit.signature];
      } else if (props.commitBoxColor === 'branch') {
        //TODO branch color
        color = props.branchesColorPalette[getBranch(props, commit)];
        if (color === undefined) {
          color = 'red';
        }
      }
      return color;
    }

    function getBranch(props, commit) {
      let branch = '';
      for (const b in props.branches) {
        const branchName = props.branches[b].branch;
        if (commit.branch.includes(branchName)) {
          branch = branchName;
          break;
        }
      }
      return branch;
    }

    function getCommitInfo(props, commit) {
      //TODO font size
      const commitInfo = [];

      commitInfo.push(
        <h1>
          <b>Commit</b>
          <br />
          {commit.messageHeader}
        </h1>
      );
      commitInfo.push(<hr />);
      if (props.showCommitMessage) {
        commitInfo.push(
          <text fontSize="smaller">
            <b>Message:</b> {commit.message}
          </text>
        );
        commitInfo.push(<br />);
      }
      if (props.showCommitSha === 'short') {
        commitInfo.push(
          <text fontSize="smaller">
            <b>Short SHA:</b> {commit.shortSha}
          </text>
        );
        commitInfo.push(<br />);
      } else if (props.showCommitSha === 'all') {
        commitInfo.push(
          <text fontSize="smaller">
            <b>SHA:</b> {commit.sha}
          </text>
        );
        commitInfo.push(<br />);
      }
      if (props.showCommitDate) {
        commitInfo.push(
          <text fontSize="smaller">
            <b>Date:</b> {commit.date}
          </text>
        );
        commitInfo.push(<br />);
      }
      if (props.showCommitAuthor) {
        commitInfo.push(
          <text fontSize="smaller">
            <b>Author:</b> {commit.signature}
          </text>
        );
        commitInfo.push(<br />);
      }
      if (props.showCommitBranch) {
        commitInfo.push(
          <text fontSize="smaller">
            <b>Branch:</b> {getBranch(props, commit)}
          </text>
        );
        commitInfo.push(<br />);
      }
      if (props.showCommitWeblink) {
        commitInfo.push(
          <a href={commit.webUrl}>
            <text fontSize="smaller">
              <b>URL:</b> {commit.webUrl}
            </text>
          </a>
        );
        commitInfo.push(<br />);
      }
      if (props.showCommitFiles) {
        commitInfo.push(
          <text fontSize="smaller">
            <b>Files:</b>
          </text>
        );
        commitInfo.push(<br />);
        const files = props.commitFiles[commit.sha];
        for (const f in files) {
          const file = files[f];
          commitInfo.push(
            <a href={file.webUrl}>
              <text fontSize="smaller">
                {file.path}
              </text>
            </a>
          );
          commitInfo.push(<br />);
        }
      }
      return commitInfo;
    }

    function getArrow(x, y, height, width, color) {
      //TODO Arrow
      const arrow = [];

      const lineXstart = x + width + 5;
      const lineY = y + height / 2;
      const lineXend = x + width + space - 5;
      const pointsForLine = '' + lineXstart.toString() + ',' + lineY.toString() + ' ' + lineXend.toString() + ',' + lineY.toString();

      const arrowHeadYup = y + height / 4;
      const arrowHeadYdown = y + height / 4 * 3;
      const arrowHeadX = lineXstart + (lineXend - lineXstart) / 4 * 3;
      const pointsForArrowHead =
        '' +
        arrowHeadX.toString() +
        ',' +
        arrowHeadYup.toString() +
        ' ' +
        lineXend.toString() +
        ',' +
        lineY.toString() +
        ' ' +
        arrowHeadX.toString() +
        ',' +
        arrowHeadYdown.toString() +
        ' ' +
        arrowHeadX.toString() +
        ',' +
        arrowHeadYup.toString();

      arrow.push(<rect x={lineXstart} y={lineY - height / 16} width={arrowHeadX - lineXstart} height={height / 8} fill={color} />);
      arrow.push(<polyline points={pointsForArrowHead} fill={color} stroke={color} />);
      return arrow;
    }

    const commitData = this.props.commits;
    const width = this.props.commitBoxWidth;
    const height = this.props.commitBoxHeight;
    const commitRects = [];
    const xStart = 20;
    let x = xStart;
    const y = 10;

    for (const i in commitData) {
      const commit = commitData[i];

      if (this.props.selectedAuthors.indexOf(commit.signature) > -1) {
        if (getBranch(this.props, commit) === branch) {
          const color = getBoxColor(this.props, commit);
          if (x !== xStart) {
            commitRects.push(
              <g width={space} height={height}>
                {getArrow(x - width - space, y, height, width, this.props.branchesColorPalette[branch])}
              </g>
            );
          }
          commitRects.push(
            <g width={width} height={height}>
              <rect x={x} y={y} width={width} height={height} fill={color} />
              <foreignObject x={x} y={y} width={width} height={height} class="commitInfo">
                {getCommitInfo(this.props, commit)}
              </foreignObject>
            </g>
          );

          x = x + width + space;
        }
      } //selected Branches
    } //selected Authors

    if (commitRects.length === 0) {
      commitRects.push(
        <g width={width} height={height}>
          <rect x={x} y={y} width={width} height={height} fill={this.props.branchesColorPalette[branch]} />
          <foreignObject x={x} y={y} width={width} height={height} class="commitInfo">
            There are no commits in the {branch} Branch with the selected Filters.
          </foreignObject>
        </g>
      );
    }

    const svgWidth = (commitRects.length / 2 + 1) * this.props.commitBoxWidth + commitRects.length / 2 * space;
    const svgHeight = this.props.commitBoxHeight + 20;

    return (
      <svg
        style={{
          height: svgHeight,
          width: svgWidth
        }}>
        {commitRects}
      </svg>
    );
  }
}
