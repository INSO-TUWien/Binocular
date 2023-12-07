'use strict';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import GlobalZoomableSvg from '../../../components/svg/GlobalZoomableSvg';
import OffsetGroup from '../../../components/svg/OffsetGroup';
import ChartContainer from '../../../components/svg/ChartContainer';
import LegendCompact from '../../../components/LegendCompact/LegendCompact';
import { getChartColors } from '../../../utils';
import * as zoomUtils from '../../../utils/zoom';
import * as d3 from 'd3';
import styles from '../styles.module.scss';
import chroma from 'chroma-js';
import DotsPattern from '../../../components/svg/patterns/dots';
import HatchPattern from '../../../components/svg/patterns/hatch';

import Segment from './Segment';
import FullScreenMessage from './full-screen-message';

const Chart = ({ devData }) => {
  const chartSizeFactor = 0.85;

  //global state from redux store
  const config = useSelector((state) => state.visualizations.codeExpertise.state.config);
  const mode = useSelector((state) => state.visualizations.codeExpertise.state.config.mode);

  const universalSettings = useSelector((state) => state.universalSettings);
  const authorColors = universalSettings.universalSettingsData.data.palette;

  //local state
  const [transform, setTransform] = useState(d3.zoomIdentity);
  const [dimensions, setDimensions] = useState(zoomUtils.initialDimensions());
  const [radius, setRadius] = useState((Math.min(dimensions.height, dimensions.width) / 2) * chartSizeFactor);
  const [segments, setSegments] = useState([]);

  const center = {
    x: dimensions.width / 2,
    y: dimensions.height / 2,
  };

  //for legend
  const legendGoodCommitsColor = chroma('green').brighten().brighten().hex();
  const legendBadCommitsColor = chroma('red').brighten().brighten().hex();
  const legendColor = getChartColors('spectral', _.range(0, 4))[0];
  const legendDotsId = 'legend_dots';
  const legendHatchId = 'legend_hatch';

  //functions to handle zooming and resizing of the chart
  const onResize = (evt) => {
    setDimensions(zoomUtils.onResizeFactoryForFunctional(0.7, 0.7)(evt));
  };
  const onZoom = (evt) => {
    setTransform(evt.transform);
  };

  //update radius when dimensions change.
  useEffect(() => {
    setRadius((Math.min(dimensions.height, dimensions.width) / 2) * chartSizeFactor);
  }, [dimensions]);

  //only (re-)create segments if data changes
  useEffect(() => {
    //total number of added lines by all stakeholders of the currently selected issue
    const additionsTotal = _.reduce(
      devData,
      (sum, adds) => {
        return sum + adds.additions;
      },
      0
    );

    const linesOwnedTotal = _.reduce(
      devData,
      (sum, data) => {
        if (data.linesOwned) {
          return sum + data.linesOwned;
        } else {
          return sum;
        }
      },
      0
    );

    //get the maximum number of commits over all currently relevant devs
    let maxCommitsPerDev = 0;
    Object.entries(devData).map((item, index) => {
      const data = item[1];
      const commits = data.commits.length;
      if (commits > maxCommitsPerDev) {
        maxCommitsPerDev = commits;
      }
    });

    const segments = [];
    let totalPercent = 0;

    Object.entries(devData).map((item, index) => {
      const name = item[0];
      const devData = item[1];
      const devAdditions = devData.additions;
      const devLinesOwned = devData.linesOwned;

      //we dont care about stakeholders that for example only have deletions for selected files
      if (devAdditions === 0) return;

      //at which point in a circle should the segment start
      const startPercent = totalPercent;

      //adds the percentage of additions/ownership of the dev relative to all additions to the current percentage state
      if (config.onlyDisplayOwnership) {
        //dont display a segment for a dev who does not own lines
        if (!devLinesOwned) {
          return;
        }
        totalPercent += devLinesOwned / linesOwnedTotal;
      } else {
        totalPercent += devAdditions / additionsTotal;
      }

      //at which point in a circle should the segment end
      const endPercent = totalPercent;

      segments.push(
        <Segment
          key={index}
          rad={radius}
          startPercent={startPercent}
          endPercent={endPercent}
          devName={name}
          devData={devData}
          devColor={authorColors[name]}
          maxCommitsPerDev={maxCommitsPerDev}
        />
      );
    });

    setSegments(segments);
  }, [devData, radius, config.onlyDisplayOwnership, universalSettings]);

  //if there are no commits to be shown
  //(for example if a branch/issue combination is selected where no commits on the branch are tagged with the respective issueId)
  if (segments.length === 0) {
    return <FullScreenMessage message={'There are no commits for your current selection!'} />;
  }

  return (
    <ChartContainer onResize={(evt) => onResize(evt)} className={styles.chartContainer}>
      <div className={styles.legend}>
        <g>
          <svg width={0} height={0}>
            <defs>
              {DotsPattern(legendColor, legendDotsId)}
              {HatchPattern(legendColor, legendHatchId)}
            </defs>
          </svg>

          <LegendCompact text="Good Commits rel. to all Commits of Dev" color={legendGoodCommitsColor} />
          <LegendCompact text="Bad Commits rel. to all Commits of Dev" color={legendBadCommitsColor} />
          <LegendCompact text="# of Commits rel. to others" color={`url(#${legendDotsId})`} />
          {mode === 'issues' && <LegendCompact text="Added lines of code" color={`url(#${legendHatchId})`} />}
          {!(mode === 'issues') && (
            <>
              <LegendCompact text="Added lines of code" color={`url(#${legendHatchId})`} color2={legendColor} />
              <LegendCompact text="Added lines of code (still in the Project)" color={legendColor} />
            </>
          )}
        </g>
      </div>
      <GlobalZoomableSvg className={styles.chart} scaleExtent={[1, 10]} onZoom={(evt) => onZoom(evt)} transform={transform}>
        <OffsetGroup dims={dimensions} transform={transform}>
          <g transform={`translate(${center.x}, ${center.y})`}>
            {segments}
            <circle cx="0" cy="0" r={radius / 3} stroke="black" fill="white" />
          </g>
        </OffsetGroup>
      </GlobalZoomableSvg>
    </ChartContainer>
  );
};

export default Chart;
