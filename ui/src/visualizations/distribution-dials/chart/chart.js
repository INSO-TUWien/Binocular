'use strict';

import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import GlobalZoomableSvg from '../../../components/svg/GlobalZoomableSvg.js';
import OffsetGroup from '../../../components/svg/OffsetGroup.js';
import ChartContainer from '../../../components/svg/ChartContainer.js';
import * as zoomUtils from '../../../utils/zoom.js';
import * as d3 from 'd3';
import styles from '../styles.scss';
import StackedDial from './stackedDial.js';
import {
  getAngle,
  getAngleAdjusted,
  getCoordinatesForAngle,
  getOuterCoordinatesForBucket,
  splitCommitsByAuthor,
  splitIssuesByAuthor,
} from './utils.js';
import BezierDial from './bezierDial.js';
import chroma from 'chroma-js';
import LegendCompact from '../../../components/LegendCompact/LegendCompact.js';
import CenterCircle from './centerCircle.js';

export default ({ data }) => {
  const chartSizeFactor = 0.9;
  const uiSizeFactor = 0.95;
  const innerCircleRadiusFactor = 0.33;

  const issuesColor = '#118ab2';
  const commitsColor = '#06d6a0';
  const changesColor = '#ffd166';

  //global state
  const distributionDialsState = useSelector((state) => state.visualizations.distributionDials.state);

  const layers = distributionDialsState.config.layers;
  const selectedLayers = distributionDialsState.config.layersSelected;
  const splitLayers = distributionDialsState.config.layersSplit;

  //local state
  const [transform, setTransform] = useState(d3.zoomIdentity);
  const [dimensions, setDimensions] = useState(zoomUtils.initialDimensions());
  const [chartRadius, setChartRadius] = useState(0);
  const [uiRadius, setUiRadius] = useState(0);
  const [chartParts, setChartParts] = useState([]);
  const [dialLines, setDialLines] = useState([]);
  const [labels, setLabels] = useState([]);

  const [centerCircleLabel, setCenterCircleLabel] = useState('');
  const [centerCircleData, setCenterCircleData] = useState([]);
  const [isCenterCircleDataVisible, setIsCenterCircleDataVisible] = useState(false);

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

  const onHoverData = (label, data) => {
    if (!label) {
      setIsCenterCircleDataVisible(false);
    } else {
      setCenterCircleLabel(label);
      setCenterCircleData(data);
      setIsCenterCircleDataVisible(true);
    }
  };

  //update radius when dimensions change.
  useEffect(() => {
    setChartRadius((Math.min(dimensions.fullHeight, dimensions.fullWidth) / 2) * chartSizeFactor);
    setUiRadius((Math.min(dimensions.fullHeight, dimensions.fullWidth) / 2) * uiSizeFactor);
  }, [dimensions]);

  //update parts of the chart when data changes
  useEffect(() => {
    const dials = [];
    const numOfDials = selectedLayers.length;
    const sortedSelectedLayers = layers.filter((l) => selectedLayers.includes(l));

    for (let i = 0; i < sortedSelectedLayers.length; i++) {
      const part = sortedSelectedLayers[i];

      const innerCircleRadius = chartRadius * innerCircleRadiusFactor;
      const innerRad = innerCircleRadius + ((chartRadius - innerCircleRadius) / numOfDials) * i;
      const outerRad = innerCircleRadius + ((chartRadius - innerCircleRadius) / numOfDials) * (i + 1);

      const commitsByBucketAndAuthor = data.map((bucket) => splitCommitsByAuthor(bucket.commits));
      const issuesByBucketAndAuthor = data.map((bucket) => splitIssuesByAuthor(bucket.issuesCreated, bucket.issuesClosed));

      if (part === 'issues') {
        if (splitLayers.includes(part)) {
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
          //otherwise, we just have the total number of issues that were either created or closed in the specified timeframe by each author
          const issuesNumberByAuthors = issuesByBucketAndAuthor.map((bucket) =>
            bucket.map((author) => {
              return {
                name: author.name,
                data: author.issues,
              };
            })
          );

          dials.push(
            <BezierDial
              label={part}
              innerRad={innerRad}
              outerRad={outerRad}
              data={issuesNumberByAuthors}
              color={issuesColor}
              key={'issues'}
              onHoverData={onHoverData}
            />
          );
        }
      } else if (part === 'changes') {
        if (splitLayers.includes(part)) {
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
          //if the dial is not split, we count the number of changes (additions + deletions) for each author for each bucket
          const changesByAuthors = commitsByBucketAndAuthor.map((bucket) =>
            bucket.map((author) => {
              return {
                name: author.name,
                data: author.additions + author.deletions,
              };
            })
          );

          dials.push(
            <BezierDial
              label={part}
              innerRad={innerRad}
              outerRad={outerRad}
              data={changesByAuthors}
              color={changesColor}
              key={'changes'}
              onHoverData={onHoverData}
            />
          );
        }
      } else if (part === 'commits') {
        if (splitLayers.includes(part)) {
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
              colors={['red', 'DarkGray', 'green']}
              key={'commits_split'}
            />
          );
        } else {
          //just the total number of commits for each author in each bucket
          const commitsNumberByAuthors = commitsByBucketAndAuthor.map((bucket) =>
            bucket.map((author) => {
              return {
                name: author.name,
                data: author.commits,
              };
            })
          );

          dials.push(
            <BezierDial
              label={part}
              innerRad={innerRad}
              outerRad={outerRad}
              data={commitsNumberByAuthors}
              color={commitsColor}
              key={'commits'}
              onHoverData={onHoverData}
            />
          );
        }
      }
    }

    //reverse so the smallest dial is rendered last (on top of the larger dials)
    setChartParts(dials.reverse());
  }, [chartRadius, data, layers, splitLayers, selectedLayers]);

  //update Lables when data changes
  useEffect(() => {
    const labels = [];

    //check if labels are long or short
    const longLabels = Math.max(...data.map((d) => d.label.length)) > 3;

    for (let i = 0; i < data.length; i++) {
      const label = data[i].label;

      //If the label is long (like weekdays), display the label in an arc outside the segment
      // so it does not interfere with the visualization
      if (longLabels) {
        //arc for the text
        let arcStartAngle = getAngle(i / data.length);
        let arcEndAngle = getAngle((0.99999 + i) / data.length);
        let arcMiddleAngle = arcStartAngle + (arcEndAngle - arcStartAngle) / 2;

        //if the text is on the bottom half of the diagram
        const textReversed = arcMiddleAngle > Math.PI / 2 && arcMiddleAngle < 1.5 * Math.PI;
        const labelArc = d3
          .arc()
          .innerRadius(uiRadius)
          .outerRadius(uiRadius)
          .startAngle(textReversed ? arcEndAngle : arcStartAngle)
          .endAngle(textReversed ? arcStartAngle : arcEndAngle);

        labels.push(
          <g key={'label_' + label}>
            <defs>
              <path d={labelArc().toString()} id={`${label}_arc`} />
            </defs>
            <text>
              <textPath href={`#${label}_arc`} startOffset={'25%'} textAnchor="middle" alignmentBaseline="middle">
                {label}
              </textPath>
            </text>
          </g>
        );
      } else {
        //else this is a short label. which can be displayed normally
        const coords = getOuterCoordinatesForBucket(i, data.length, chartRadius);
        labels.push(
          <text x={coords[0]} y={coords[1]} key={'label_' + label} textAnchor="middle" alignmentBaseline="middle">
            {label}
          </text>
        );
      }
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
            <CenterCircle
              radius={chartRadius * innerCircleRadiusFactor}
              label={centerCircleLabel}
              data={centerCircleData}
              isDataVisible={isCenterCircleDataVisible}
            />
            {labels}
          </g>
        </OffsetGroup>
      </GlobalZoomableSvg>
    </ChartContainer>
  );
};
