'use strict';

import React from 'react';
import * as d3 from 'd3';

import styles from '../styles.module.scss';
import _ from 'lodash';

import StackedAreaChart from '../../../../components/StackedAreaChart';
import moment from 'moment';
import LegendCompact from '../../../../components/LegendCompact';

export default class IssueBreakdown extends React.Component {
  constructor(props) {
    super(props);
    const { issueChartData, issueScale } = this.extractIssueData(props);
    this.state = {
      issueChartData,
      issueScale,
    };
  }

  /**
   * Update computed commit data
   * @param nextProps props that are passed
   */
  componentWillReceiveProps(nextProps) {
    const { issueChartData, issueScale } = this.extractIssueData(nextProps);

    this.setState({
      issueChartData,
      issueScale,
    });
  }

  render() {
    const issueBreakdownChart = (
      <div className={styles.chartLine}>
        <div className={styles.chart}>
          {this.state.issueChartData !== undefined && this.state.issueChartData.length > 0 ? (
            <StackedAreaChart
              content={this.state.issueChartData}
              palette={{ Opened: '#3461eb' }}
              paddings={{ top: 20, left: 60, bottom: 20, right: 30 }}
              xAxisCenter={true}
              yDims={this.state.issueScale}
              d3offset={d3.stackOffsetDiverging}
              resolution={this.props.chartResolution}
            />
          ) : (
            <div className={styles.errorMessage}>No data during this time period!</div>
          )}
        </div>
      </div>
    );
    const loadingHint = (
      <div className={styles.loadingHintContainer}>
        <h1 className={styles.loadingHint}>
          Loading... <i className="fas fa-spinner fa-pulse" />
        </h1>
      </div>
    );
    const legend = (
      <div className={styles.legend}>
        <LegendCompact text="Open Issues" color="#3461eb" />
      </div>
    );
    return (
      <div className={styles.chartContainer}>
        {this.state.issueChartData === null && loadingHint}
        {issueBreakdownChart}
        {legend}
      </div>
    );
  }

  extractIssueData(props) {
    if (!props.issues || props.issues.length === 0) {
      return {};
    }

    let firstTimestamp = props.firstIssueTimestamp;
    let lastTimestamp = props.lastIssueTimestamp;
    let issues = props.issues;

    const issueChartData = [];
    const issueScale = [0, 0];
    if (props.universalSettings) {
      issues = props.filteredIssues;
      firstTimestamp = props.firstSignificantTimestamp;
      lastTimestamp = props.lastSignificantTimestamp;
    }

    if (issues.length > 0) {
      //---- STEP 1: FILTER ISSUES ----
      let filteredIssues = issues;

      // explicitly check if the value is false, because in standalone mode, this is undefined.
      //   But then we also want the universal settings to have an effect
      // if this visualization is part of the dashboard, this value is either true or false
      if (props.universalSettings !== false) {
        filteredIssues = filteredIssues.filter((issue) => {
          let filter = false;
          if (props.selectedAuthors.filter((a) => a === 'others').length > 0) {
            filter = true;
          }
          for (const author of Object.keys(props.allAuthors)) {
            const authorName = author.split('<')[0].slice(0, -1);
            if (issue.author.name === authorName) {
              if (props.selectedAuthors.filter((a) => a === author).length > 0) {
                filter = true;
                break;
              } else {
                filter = false;
                break;
              }
            }
          }
          return filter;
        });
      }

      //---- STEP 2: AGGREGATE ISSUES PER TIME INTERVAL ----
      const data = [];
      const granularity = this.getGranularity(props.chartResolution);
      const curr = moment(firstTimestamp).startOf(granularity.unit).subtract(1, props.chartResolution);
      const next = moment(curr).add(1, props.chartResolution);
      const end = moment(lastTimestamp).endOf(granularity.unit).add(1, props.chartResolution);
      const sortedCloseDates = [];
      const createdDate = Date.parse(issues[0].createdAt);

      for (; curr.isSameOrBefore(end); curr.add(1, props.chartResolution), next.add(1, props.chartResolution)) {
        //Iterate through time buckets
        const currTimestamp = curr.toDate().getTime();
        const nextTimestamp = next.toDate().getTime();

        const openedIssues = filteredIssues.filter(
          (issue) => Date.parse(issue.createdAt) >= currTimestamp && Date.parse(issue.createdAt) < nextTimestamp,
        );

        const closedIssues = filteredIssues.filter(
          (issue) => Date.parse(issue.closedAt) >= currTimestamp && Date.parse(issue.closedAt) < nextTimestamp,
        );

        data.push({
          date: currTimestamp,
          count: openedIssues.length + closedIssues.length,
          openCount: openedIssues.length - closedIssues.length,
        });
      }

      //---- STEP 3: CONSTRUCT CHART DATA FROM AGGREGATED ISSUES ----

      let aggregatedOpenCount = 0;

      _.each(data, function (issue) {
        aggregatedOpenCount += issue.openCount;
        issueChartData.push({
          date: issue.date,
          Opened: aggregatedOpenCount,
          Cosed: 0,
        });
        if (aggregatedOpenCount > issueScale[1]) {
          issueScale[1] = aggregatedOpenCount;
        }
      });
    }

    return { issueChartData, issueScale };
  }

  getGranularity(resolution) {
    switch (resolution) {
      case 'years':
        return { interval: moment.duration(1, 'year'), unit: 'year' };
      case 'months':
        return { interval: moment.duration(1, 'month'), unit: 'month' };
      case 'weeks':
        return { interval: moment.duration(1, 'week'), unit: 'week' };
      case 'days':
        return { interval: moment.duration(1, 'day'), unit: 'day' };
      default:
        return { interval: 0, unit: '' };
    }
  }
}
