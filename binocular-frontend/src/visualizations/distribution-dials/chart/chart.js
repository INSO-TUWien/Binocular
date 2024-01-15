'use strict';

import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import GlobalZoomableSvg from '../../../components/svg/GlobalZoomableSvg.js';
import OffsetGroup from '../../../components/svg/OffsetGroup.js';
import ChartContainer from '../../../components/svg/ChartContainer.js';
import * as zoomUtils from '../../../utils/zoom.js';
import * as d3 from 'd3';
import styles from '../styles.module.scss';
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
import LegendCompact from '../../../components/LegendCompact/LegendCompact.js';
import CenterCircle from './centerCircle.js';
import chroma from 'chroma-js';

export default ({ data }) => {
  const chartSizeFactor = 0.9;
  const uiSizeFactor = 0.95;
  const innerCircleRadiusFactor = 0.33;

  const issuesColor = '#118ab2';
  const issuesColorsSplit = [chroma(issuesColor).darken().hex(), chroma(issuesColor).brighten().hex()];
  const commitsColor = '#06d6a0';
  const commitsColorsSplit = ['red', 'DarkGray', 'green'];
  const changesColor = '#ffd166';
  const changesColorsSplit = [chroma(changesColor).darken().hex(), changesColor];

  //global state
  const distributionDialsState = useSelector((state) => state.visualizations.distributionDials.state);

  const layers = distributionDialsState.config.layers;
  const selectedLayers = distributionDialsState.config.layersSelected;
  const splitLayers = distributionDialsState.config.layersSplit;
  const colorSegments = distributionDialsState.config.colorSegments;

  //local state
  const [transform, setTransform] = useState(d3.zoomIdentity);
  const [dimensions, setDimensions] = useState(zoomUtils.initialDimensions());
  const [chartRadius, setChartRadius] = useState(0);
  const [uiRadius, setUiRadius] = useState(0);
  const [chartParts, setChartParts] = useState([]);
  const [dialLines, setDialLines] = useState([]);
  const [labels, setLabels] = useState([]);
  const [legend, setLegend] = useState([]);

  const [centerCircleLabel, setCenterCircleLabel] = useState('');
  const [centerCircleData, setCenterCircleData] = useState([]);
  const [centerCircleColorScheme, setCenterCircleColorScheme] = useState([]);
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

  const onHoverData = (label, data, colors) => {
    if (!label) {
      setIsCenterCircleDataVisible(false);
    } else {
      setIsCenterCircleDataVisible(true);
    }

    setCenterCircleLabel(label);
    setCenterCircleData(data);
    setCenterCircleColorScheme(colors);
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
    const sortedSelectedLayers = layers.toReversed().filter((l) => selectedLayers.includes(l));

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
          const issuesOpenedAndClosedByAuthor = issuesByBucketAndAuthor.map((bucket) =>
            bucket.map((author) => {
              return {
                name: author.name,
                data: [author.issuesClosed, author.issuesCreated],
              };
            }),
          );

          dials.push(
            <StackedDial
              label={part}
              innerRad={innerRad}
              outerRad={outerRad}
              data={issuesOpenedAndClosedByAuthor}
              colors={issuesColorsSplit}
              key={'issues_split'}
              onHoverData={onHoverData}
            />,
          );
        } else {
          //otherwise, we just have the total number of issues that were either created or closed in the specified timeframe by each author
          const issuesNumberByAuthors = issuesByBucketAndAuthor.map((bucket) =>
            bucket.map((author) => {
              return {
                name: author.name,
                data: author.issues,
              };
            }),
          );

          //there are no author colors for ITS data, so colorSegmentsForAuthors is hardcoded to false
          dials.push(
            <BezierDial
              label={part}
              innerRad={innerRad}
              outerRad={outerRad}
              data={issuesNumberByAuthors}
              color={issuesColor}
              key={'issues'}
              onHoverData={onHoverData}
              colorSegmentsForAuthors={false}
            />,
          );
        }
      } else if (part === 'changes') {
        if (splitLayers.includes(part)) {
          //if this dial is split, we have the number of additions on the outside
          // and the number of deletions an the inside
          const changesByAuthors = commitsByBucketAndAuthor.map((bucket) =>
            bucket.map((author) => {
              return {
                name: author.name,
                data: [author.deletions, author.additions],
              };
            }),
          );
          dials.push(
            <StackedDial
              label={part}
              innerRad={innerRad}
              outerRad={outerRad}
              data={changesByAuthors}
              colors={changesColorsSplit}
              key={'changes_split'}
              onHoverData={onHoverData}
            />,
          );
        } else {
          //if the dial is not split, we count the number of changes (additions + deletions) for each author for each bucket
          const changesByAuthors = commitsByBucketAndAuthor.map((bucket) =>
            bucket.map((author) => {
              return {
                name: author.name,
                data: author.additions + author.deletions,
              };
            }),
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
              colorSegmentsForAuthors={colorSegments}
            />,
          );
        }
      } else if (part === 'commits') {
        if (splitLayers.includes(part)) {
          //if this dial is split, we split the commits in good, bad and neutral based on the CI runs
          const commitsNumberByAuthors = commitsByBucketAndAuthor.map((bucket) =>
            bucket.map((author) => {
              const neutralCommits = author.commits - author.badCommits - author.goodCommits;
              return {
                name: author.name,
                data: [author.badCommits, neutralCommits, author.goodCommits],
              };
            }),
          );

          dials.push(
            <StackedDial
              label={part}
              innerRad={innerRad}
              outerRad={outerRad}
              data={commitsNumberByAuthors}
              colors={commitsColorsSplit}
              key={'commits_split'}
              onHoverData={onHoverData}
            />,
          );
        } else {
          //just the total number of commits for each author in each bucket
          const commitsNumberByAuthors = commitsByBucketAndAuthor.map((bucket) =>
            bucket.map((author) => {
              return {
                name: author.name,
                data: author.commits,
              };
            }),
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
              colorSegmentsForAuthors={colorSegments}
            />,
          );
        }
      }
    }

    //reverse so the smallest dial is rendered last (on top of the larger dials)
    setChartParts(dials.reverse());
  }, [chartRadius, data, layers, splitLayers, selectedLayers, colorSegments]);

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
        const arcStartAngle = getAngle(i / data.length);
        const arcEndAngle = getAngle((0.99999 + i) / data.length);
        const arcMiddleAngle = arcStartAngle + (arcEndAngle - arcStartAngle) / 2;

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
          </g>,
        );
      } else {
        //else this is a short label. which can be displayed normally
        const coords = getOuterCoordinatesForBucket(i, data.length, chartRadius);
        labels.push(
          <text x={coords[0]} y={coords[1]} key={'label_' + label} textAnchor="middle" alignmentBaseline="middle">
            {label}
          </text>,
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

  useEffect(() => {
    setLegend(
      layers
        .filter((l) => selectedLayers.includes(l))
        .map((l, i) => {
          if (l === 'issues') {
            if (splitLayers.includes(l)) {
              return (
                <LegendCompact key={'layer' + i} text="issues opened/closed" color={issuesColorsSplit[1]} color2={issuesColorsSplit[0]} />
              );
            } else {
              return <LegendCompact key={'layer' + i} text="issues" color={issuesColor} />;
            }
          } else if (l === 'changes') {
            if (splitLayers.includes(l)) {
              return (
                <LegendCompact key={'layer' + i} text="additions/deletions" color={changesColorsSplit[1]} color2={changesColorsSplit[0]} />
              );
            } else {
              return <LegendCompact key={'layer' + i} text="changes" color={changesColor} />;
            }
          } else if (l === 'commits') {
            if (splitLayers.includes(l)) {
              return (
                <LegendCompact
                  key={'layer' + i}
                  text="good/neutral/bad commits"
                  color={commitsColorsSplit[2]}
                  color2={commitsColorsSplit[1]}
                  color3={commitsColorsSplit[0]}
                />
              );
            } else {
              return <LegendCompact key={'layer' + i} text="commits" color={commitsColor} />;
            }
          }
        }),
    );
  }, [layers, selectedLayers, splitLayers]);

  return (
    <ChartContainer onResize={(evt) => onResize(evt)} className={styles.chartContainer}>
      <div className={styles.legend}>
        <div>{legend}</div>
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
              colors={centerCircleColorScheme}
              isDataVisible={isCenterCircleDataVisible}
            />
            {labels}
          </g>
        </OffsetGroup>
      </GlobalZoomableSvg>
    </ChartContainer>
  );
};
