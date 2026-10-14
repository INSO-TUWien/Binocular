'use strict';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import StackedAreaChart from '../../../components/StackedAreaChart';
import styles from '../styles.module.scss';
import * as d3 from 'd3';
import _ from 'lodash';

export default () => {
  // Local state
  const [chartData, setChartData] = useState([]);
  const [chartComponent, setChartComponent] = useState(null);

  // Global state
  const issueLabelsState = useSelector((state) => state.visualizations.issueLabels.state);
  const isLoading = issueLabelsState.data.isFetching;
  const data = issueLabelsState.data.data;
  const currentBranch = issueLabelsState.config.currentBranch;
  const selectedLabels = issueLabelsState.config.selectedLabels;

  const universalSettings = useSelector((state) => state.universalSettings);
  const dataGranularity = universalSettings.chartResolution;

  // Transform data for the chart
  useEffect(() => {
    if (data === undefined || data === null) {
      return;
    }

    // Check if data is an empty object or has no timeline changes
    if (Object.keys(data).length === 0 || !data.timelineChanges || data.timelineChanges.length === 0) {
      setChartData([]);
      return;
    }

    // Transform data for the chart
    const transformedData = data.timelineChanges.map((item) => {
      const result = {}

      result.date = new Date(item.date).getTime();

      result.additions = item.additions;
      result.deletions = item.deletions;

      return result;
    });

    if (dataGranularity === 'days') {
      setChartData(transformedData);
    } else {
      let groupedResult;

      if (dataGranularity === 'years') {
        groupedResult = _.groupBy(transformedData, (dataPoint) => '' + new Date(dataPoint.date).getFullYear());
      } else if (dataGranularity === 'months') {
        groupedResult = _.groupBy(
          transformedData,
          (dataPoint) => '' + new Date(dataPoint.date).getMonth() + '-' + new Date(dataPoint.date).getFullYear(),
        );
      } else if (dataGranularity === 'weeks') {
        groupedResult = _.groupBy(transformedData, (dataPoint) => {
          const d = new Date(dataPoint.date);
          const onejan = new Date(d.getFullYear(), 0, 1);
          const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
          return '' + week + '-' + d.getFullYear();
        });
      } else {
        //invalid granularity
        console.log('Error in Issue labels: granularity "' + dataGranularity + '" not valid');
        setChartData(transformedData);
        return;
      }

      const coarseResult = [];

      for (const [, points] of Object.entries(groupedResult)) {
        const dataPoints = points.sort((a, b) => a.date - b.date);
        const additions = dataPoints.reduce((sum, p) => sum + p.additions, 0);
        const deletions = dataPoints.reduce((sum, p) => sum + p.deletions, 0);
        coarseResult.push({ date: dataPoints.slice(-1)[0].date, additions, deletions });
      }

      setChartData(coarseResult);
    }
  }, [data, universalSettings]);

  // Set up chart component when data changes
  useEffect(() => {
    if (chartData && chartData.length !== 0) {
      setChartComponent(
        <StackedAreaChart
          content={chartData}
          palette={{
            additions: '#4CAF50',
            deletions: '#F44336',
          }}
          paddings={{ top: 20, left: 50, bottom: 30, right: 30 }}
          yDims={[0, d3.max(chartData, (d) => d.additions + d.deletions)]}
          d3offset={d3.stackOffsetNone}
          resolution={dataGranularity}
          order={['additions', 'deletions']}
        />,
      );
    } else {
      setChartComponent(null);
    }
  }, [chartData]);

  const FullScreenMessage = ({ message }) => {
    return (
      <div className={styles.chartContainer}>
        <div className={styles.chart}>
          <div className={styles.messageContainer}>
            <h1>{message}</h1>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <FullScreenMessage message="Loading..." />;
  }

  if (currentBranch === undefined || currentBranch === null) {
    return <FullScreenMessage message="Select a branch" />;
  }

  if (!selectedLabels || selectedLabels.length === 0) {
    return <FullScreenMessage message="Select one or more labels" />;
  }

  if (chartData === undefined || chartData === null || chartData.length === 0) {
    return <FullScreenMessage message="No data available" />;
  }

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chart}>{chartComponent}</div>
    </div>
  );
};
