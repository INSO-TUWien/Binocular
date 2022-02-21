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
    const space = 50;
    const commitBoxes = this.getCommitsDraw(space);
    //const svgHeight = (commitRects.length / 2 + 1) * this.props.commitBoxHeight + (commitRects.length / 2) * space;
    const svgHeight = this.props.commitBoxHeight + space;
    const svgWidth = (commitBoxes.length / 2 + 1) * this.props.commitBoxHeight + commitBoxes.length / 2 * space;
    return (
      <div className={styles.chartContainer}>
        <div id={'myChartDiv'} className={styles.chartDiv}>
          <svg style={{ width: svgWidth, height: svgHeight }}>
            {commitBoxes}
          </svg>
        </div>
      </div>
    );
  }

  getCommitsDraw(space) {
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
          {commit.messageHeader}
        </h1>
      );
      commitInfo.push(<hr />);
      if (props.showCommitMessage) {
        commitInfo.push(
          <text fontSize="smaller">
            Message: {commit.message}
          </text>
        );
      }
      if (props.showCommitSha === 'short') {
        commitInfo.push(
          <text fontSize="smaller">
            Short SHA: {commit.shortSha}
          </text>
        );
      } else if (props.showCommitSha === 'all') {
        commitInfo.push(<text fontSize="smaller">SHA: {commit.sha}</text>);
      }
      if (props.showCommitDate) {
        commitInfo.push(
          <text fontSize="smaller">
            Date: {commit.date}
          </text>
        );
      }
      if (props.showCommitAuthor) {
        commitInfo.push(
          <text fontSize="smaller">
            Author: {commit.signature}
          </text>
        );
      }
      if (props.showCommitWeblink) {
        commitInfo.push(
          <a href={commit.webUrl}>
            <text fontSize="smaller">
              URL: {commit.webUrl}
            </text>
          </a>
        );
      }
      if (props.showCommitFiles) {
        commitInfo.push(<text fontSize="smaller">Files:</text>);
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

    function getArrow(x, y, height, width) {
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
        arrowHeadYdown.toString();

      arrow.push(<polyline points={pointsForLine} fill="none" stroke="black" />);
      arrow.push(<polyline points={pointsForArrowHead} fill="none" stroke="black" />);
      return arrow;
    }

    const commitData = this.props.commits;
    const width = this.props.commitBoxWidth;
    const height = this.props.commitBoxHeight;
    const commitRects = [];
    let x = 20;
    const y = 20;
    for (const i in commitData) {
      const commit = commitData[i];
      if (this.props.selectedAuthors.indexOf(commit.signature) > -1) {
        if (this.props.selectedBranches.indexOf(getBranch(this.props, commit)) > -1) {
          const color = getBoxColor(this.props, commit);
          commitRects.push(
            <g width={width} height={height}>
              <rect x={x} y={y} width={width} height={height} fill={color} />
              <foreignObject x={x} y={y} width={width} height={height}>
                {getCommitInfo(this.props, commit)}
              </foreignObject>
            </g>
          );

          commitRects.push(
            <g width={width} height={height}>
              {getArrow(x, y, height, width)}
            </g>
          );

          x = x + width + space;
          //y = y + height + space; //TODO auskommentieren
        }
      }
    }
    commitRects.pop(); //remove last arrow
    return commitRects;
  }
}
