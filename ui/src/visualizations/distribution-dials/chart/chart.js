'use strict';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import GlobalZoomableSvg from '../../../components/svg/GlobalZoomableSvg.js';
import OffsetGroup from '../../../components/svg/OffsetGroup.js';
import ChartContainer from '../../../components/svg/ChartContainer.js';
import * as zoomUtils from '../../../utils/zoom.js';
import * as d3 from 'd3';
import styles from '../styles.scss';
import StackedDial from './stackedDial.js';
import { getAngleAdjusted, getCoordinatesForAngle, getOuterCoordinatesForBucket } from './utils.js';
import BezierDial from './bezierDial.js';
import chroma from 'chroma-js';
import LegendCompact from '../../../components/LegendCompact/LegendCompact.js';

export default ({ data }) => {
  const chartSizeFactor = 0.9;
  const uiSizeFactor = 0.95;
  const innerCircleRadiusFactor = 0.15;

  const issuesColor = chroma.rgb(65, 109, 181).hex();
  const commitsColor = chroma.rgb(158, 1, 66).hex();
  const changesColor = chroma.rgb(128, 205, 164).hex();

  //global state
  const distributionDialsState = useSelector((state) => state.visualizations.distributionDials.state);

  //TODO get this from config state
  const parts = ['issues', 'changes', 'commits'];
  const isCommitsSplit = distributionDialsState.config.splitCommits;
  const isChangesSplit = distributionDialsState.config.splitChanges;
  const isIssuesSplit = distributionDialsState.config.splitIssues;

  //local state
  const [transform, setTransform] = useState(d3.zoomIdentity);
  const [dimensions, setDimensions] = useState(zoomUtils.initialDimensions());
  const [chartRadius, setChartRadius] = useState(0);
  const [uiRadius, setUiRadius] = useState(0);
  const [chartParts, setChartParts] = useState([]);
  const [dialLines, setDialLines] = useState([]);
  const [labels, setLabels] = useState([]);

  const center = {
    x: dimensions.width / 2,
    y: dimensions.height / 2,
  };

  //functions to handle zooming and resizing of the chart
  const onResize = (evt) => {
    setDimensions(zoomUtils.onResizeFactoryForFunctional(0.7, 0.7)(evt));
  };
  const onZoom = (evt) => {
    setTransform(evt.transform);
  };

  //update radius when dimensions change.
  useEffect(() => {
    setChartRadius((Math.min(dimensions.fullHeight, dimensions.fullWidth) / 2) * chartSizeFactor);
    setUiRadius((Math.min(dimensions.fullHeight, dimensions.fullWidth) / 2) * uiSizeFactor);
  }, [dimensions]);

  //update parts of the chart when data changes
  useEffect(() => {
    const dials = [];
    const numOfDials = parts.length;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const innerCircleRadius = chartRadius * innerCircleRadiusFactor;
      const innerRad = innerCircleRadius + ((chartRadius - innerCircleRadius) / numOfDials) * i;
      const outerRad = innerCircleRadius + ((chartRadius - innerCircleRadius) / numOfDials) * (i + 1);

      if (part === 'issues') {
        if (isIssuesSplit) {
          //if this dial is split, we have the number of created issues on the outside
          // and the number of closed issues on the inside
          const issuesCreated = data.map((bucket) => bucket.issuesCreated.length);
          const issuesClosed = data.map((bucket) => bucket.issuesClosed.length);
          dials.push(
            <StackedDial
              innerRad={innerRad}
              outerRad={outerRad}
              data={[issuesClosed, issuesCreated]}
              colors={['DarkBlue', 'DarkTurquoise']}
              key={'issues_split'}
            />
          );
        } else {
          //otherwise, we just have the total number of issues that were either created or closed in the specified timeframe
          const issuesNumber = data.map((bucket) => {
            let allIssues = bucket.issuesCreated.concat(bucket.issuesClosed);
            //remove duplicates
            allIssues = _.uniqBy(allIssues, (i) => i.iid);
            //we are interested in the number of issues in each bucket
            return allIssues.length;
          });
          dials.push(<BezierDial innerRad={innerRad} outerRad={outerRad} data={issuesNumber} color={issuesColor} key={'issues'} />);
        }
      } else if (part === 'changes') {
        if (isChangesSplit) {
          //if this dial is split, we have the number of additions on the outside
          // and the number of deletions an the inside
          const additions = data.map((bucket) => bucket.commits.reduce((prev, curr) => prev + curr.stats.additions, 0));
          const deletions = data.map((bucket) => bucket.commits.reduce((prev, curr) => prev + curr.stats.deletions, 0));
          dials.push(
            <StackedDial
              innerRad={innerRad}
              outerRad={outerRad}
              data={[deletions, additions]}
              colors={['red', 'green']}
              key={'changes_split'}
            />
          );
        } else {
          //if the dial is not split, we count the number of changes (additions + deletions) for each bucket
          const changes = data.map((bucket) =>
            bucket.commits.reduce((prev, curr) => prev + curr.stats.additions + curr.stats.deletions, 0)
          );
          dials.push(<BezierDial innerRad={innerRad} outerRad={outerRad} data={changes} color={changesColor} key={'changes'} />);
        }
      } else if (part === 'commits') {
        if (isCommitsSplit) {
          //if this dial is split, we split the commits in good, bad and neutral based on the CI runs
          const commitsSplit = _.unzip(
            data.map((bucket) => {
              const goodCommits = bucket.commits.filter((c) => c.buildStatus === 'success').length;
              const badCommits = bucket.commits.filter((c) => c.buildStatus === 'failed').length;
              const neutralCommits = bucket.commits.length - goodCommits - badCommits;
              return [badCommits, neutralCommits, goodCommits];
            })
          );
          dials.push(
            <StackedDial
              innerRad={innerRad}
              outerRad={outerRad}
              data={commitsSplit}
              colors={['red', 'gray', 'green']}
              key={'commits_split'}
            />
          );
        } else {
          //just the total number of commits in each bucket
          const commitsNumber = data.map((bucket) => bucket.commits.length);
          dials.push(<BezierDial innerRad={innerRad} outerRad={outerRad} data={commitsNumber} color={commitsColor} key={'commits'} />);
        }
      }
    }

    //reverse so the smallest dial is rendered last (on top of the larger dials)
    setChartParts(dials.reverse());
  }, [chartRadius, data, isChangesSplit, isIssuesSplit, isCommitsSplit]);

  //update Lables when data changes
  useEffect(() => {
    const labels = [];
    for (let i = 0; i < data.length; i++) {
      const label = data[i].label;
      const coords = getOuterCoordinatesForBucket(i, data.length, chartRadius);
      labels.push(
        <text x={coords[0]} y={coords[1]} key={'label_' + label} textAnchor="middle">
          {label}
        </text>
      );
    }

    setLabels(labels);
  }, [chartRadius, data]);

  //draw the lines separating the different sections
  useEffect(() => {
    const paths = [];

    const bucketsNum = data.length;
    const stepsize = 1.0 / bucketsNum;

    for (let currentPercent = 0.0; currentPercent < 1.0; currentPercent += stepsize) {
      const p = d3.path();
      p.moveTo(0, 0);
      p.lineTo(...getCoordinatesForAngle(uiRadius, getAngleAdjusted(currentPercent)));
      paths.push(<path stroke="DarkGray" fill="none" d={p.toString()} key={'dialLine_' + currentPercent} />);
    }

    setDialLines(paths);
  }, [uiRadius, data]);

  return (
    <ChartContainer onResize={(evt) => onResize(evt)} className={styles.chartContainer}>
      <div className={styles.legend}>
        <g>
          <LegendCompact text="commits" color={commitsColor} />
          <LegendCompact text="changes" color={changesColor} />
          <LegendCompact text="issues" color={issuesColor} />
        </g>
      </div>
      <GlobalZoomableSvg className={styles.chart} scaleExtent={[1, 10]} onZoom={(evt) => onZoom(evt)} transform={transform}>
        <OffsetGroup dims={dimensions} transform={transform}>
          <g transform={`translate(${center.x}, ${center.y})`}>
            {chartParts}
            {dialLines}
            <circle cx="0" cy="0" r={chartRadius * innerCircleRadiusFactor} stroke="black" fill="white" />
            {labels}
          </g>
        </OffsetGroup>
      </GlobalZoomableSvg>
    </ChartContainer>
  );
};
