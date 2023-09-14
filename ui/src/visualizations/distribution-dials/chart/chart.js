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
import { getAngle, getCoordinatesForAngle } from './utils.js';
import BezierDial from './bezierDial.js';
import DoubleBezierDial from './doubleBezierDial.js';

export default ({ data }) => {
  const chartSizeFactor = 0.9;
  const uiSizeFactor = 0.95;
  const innerCircleRadiusFactor = 0.15;

  //global state
  //TODO get this from config state
  const parts = ['changes', 'issues', 'commits'];

  //local state
  const [transform, setTransform] = useState(d3.zoomIdentity);
  const [dimensions, setDimensions] = useState(zoomUtils.initialDimensions());
  const [chartRadius, setChartRadius] = useState(0);
  const [uiRadius, setUiRadius] = useState(0);
  const [chartParts, setChartParts] = useState([]);
  const [dialLines, setDialLines] = useState([]);

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

      //TODO get this from config state
      let isSplit = false;

      if (part === 'issues') {
        if (isSplit) {
          //if this dial is split, we have the number of created issues on the outside
          // and the number of closed issues on the inside
          const issuesCreated = data.map((bucket) => bucket.issuesCreated.length);
          const issuesClosed = data.map((bucket) => bucket.issuesClosed.length);
          dials.push(
            <DoubleBezierDial innerRadius={innerRad} outerRadius={outerRad} dataOutside={issuesCreated} dataInside={issuesClosed} />
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
          dials.push(<BezierDial innerRadius={innerRad} outerRadius={outerRad} data={issuesNumber} />);
        }
      } else if (part === 'changes') {
        if (isSplit) {
          //if this dial is split, we have the number of additions on the outside
          // and the number of deletions an the inside
          const additions = data.map((bucket) => bucket.commits.reduce((prev, curr) => prev + curr.stats.additions, 0));
          const deletions = data.map((bucket) => bucket.commits.reduce((prev, curr) => prev + curr.stats.deletions, 0));
          dials.push(<DoubleBezierDial innerRadius={innerRad} dataOutside={additions} dataInside={deletions} />);
        } else {
          //if the dial is not split, we count the number of changes (additions + deletions) for each bucket
          const changes = data.map((bucket) =>
            bucket.commits.reduce((prev, curr) => prev + curr.stats.additions + curr.stats.deletions, 0)
          );
          dials.push(<BezierDial innerRadius={innerRad} outerRadius={outerRad} data={changes} />);
        }
      } else if (part === 'commits') {
        if (isSplit) {
          //if this dial is split, we split the commits in good, bad and neutral based on the CI runs
          const commitsSplit = data.map((bucket) => {
            const goodCommits = bucket.commits.filter((c) => c.buildStatus === 'success').length;
            const badCommits = bucket.commits.filter((c) => c.buildStatus === 'failed').length;
            const neutralCommits = bucket.commits.length - goodCommits - badCommits;
            return [goodCommits, neutralCommits, badCommits];
          });
          dials.push(<StackedDial innerRadius={innerRad} outerRadius={outerRad} data={commitsSplit} />);
        } else {
          //just the total number of commits in each bucket
          const commitsNumber = data.map((bucket) => bucket.commits.length);
          dials.push(<BezierDial innerRadius={innerRad} outerRadius={outerRad} data={commitsNumber} />);
        }
      }
    }

    //reverse so the smallest dial is rendered last (on top of the larger dials)
    setChartParts(dials.reverse());
  }, [chartRadius, data]);

  //draw the lines separating the different sections
  useEffect(() => {
    const paths = [];

    const bucketsNum = data.length;
    const stepsize = 1.0 / bucketsNum;

    for (let currentPercent = 0.0; currentPercent < 1.0; currentPercent += stepsize) {
      const p = d3.path();
      p.moveTo(0, 0);
      p.lineTo(...getCoordinatesForAngle(uiRadius, getAngle(currentPercent)));
      paths.push(<path stroke="black" fill="none" d={p.toString()} />);
    }

    setDialLines(paths);
  }, [uiRadius, data]);

  return (
    <ChartContainer onResize={(evt) => onResize(evt)} className={styles.chartContainer}>
      <GlobalZoomableSvg className={styles.chart} scaleExtent={[1, 10]} onZoom={(evt) => onZoom(evt)} transform={transform}>
        <OffsetGroup dims={dimensions} transform={transform}>
          <g transform={`translate(${center.x}, ${center.y})`}>
            <circle cx="0" cy="0" r={chartRadius} stroke="black" fill="white" />
            {chartParts}
            {dialLines}
            <circle cx="0" cy="0" r={chartRadius * innerCircleRadiusFactor} stroke="black" fill="white" />
          </g>
        </OffsetGroup>
      </GlobalZoomableSvg>
    </ChartContainer>
  );
};
