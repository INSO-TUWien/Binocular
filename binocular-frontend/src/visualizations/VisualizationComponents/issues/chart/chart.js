'use strict';

import React from 'react';
import * as d3 from 'd3';

import styles from '../styles.module.scss';
import _ from 'lodash';

import StackedAreaChart from '../../../../components/StackedAreaChart';
import moment from 'moment';
import LegendCompact from '../../../../components/LegendCompact';

export default class Issues extends React.Component {
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
    const issueChart = (
      <div className={styles.chartLine}>
        <div className={styles.chart}>
          {this.state.issueChartData !== undefined && this.state.issueChartData.length > 0 ? (
            <StackedAreaChart
              content={this.state.issueChartData}
              palette={{ Opened: '#3461eb', Closed: '#8099e8' }}
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
        <LegendCompact text="Opened | Closed" color="#3461eb" color2="#8099e8" />
      </div>
    );
    return (
      <div className={styles.chartContainer}>
        {this.state.issueChartData === null && loadingHint}
        {issueChart}
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

    // explicitly check if the value is false, because in standalone mode, this is undefined.
    //   But then we also want the universal settings to have an effect
    // if this visualization is part of the dashboard, this value is either true or false
    if (props.universalSettings !== false) {
      issues = props.filteredIssues;
      firstTimestamp = props.firstSignificantTimestamp;
      lastTimestamp = props.lastSignificantTimestamp;
    }

    if (issues.length > 0) {
      //---- STEP 1: FILTER ISSUES ----
      let filteredIssues = [];
      switch (props.showIssues) {
        case 'all':
          filteredIssues = issues;
          break;
        case 'open':
          _.each(issues, (issue) => {
            if (issue.closedAt === null) {
              filteredIssues.push(issue);
            }
          });
          break;
        case 'closed':
          _.each(issues, (issue) => {
            if (issue.closedAt) {
              filteredIssues.push(issue);
            }
          });
          break;
        default:
      }

      // note: author selector in universal settings has no influence on this visualization at the time.
      // The reason is that the author selector only includes git accounts, not GitLab or GitHub accounts.
      // since this visualization uses data from either GitLab or GitHub,
      // the users in the selector do not necessarily match the users that create/close issues.

      //---- STEP 2: AGGREGATE ISSUES PER TIME INTERVAL ----
      const data = [];
      const granularity = this.getGranularity(props.chartResolution);
      const curr = moment(firstTimestamp).startOf(granularity.unit).subtract(1, props.chartResolution);
      const next = moment(curr).add(1, props.chartResolution);
      const end = moment(lastTimestamp).endOf(granularity.unit).add(1, props.chartResolution);
      const sortedCloseDates = [];
      const createdDate = Date.parse(issues[0].createdAt);

      for (let i = 0, j = 0; curr.isSameOrBefore(end); curr.add(1, props.chartResolution), next.add(1, props.chartResolution)) {
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
          openCount: openedIssues.length,
          closedCount: closedIssues.length,
        });
      }

      //---- STEP 3: CONSTRUCT CHART DATA FROM AGGREGATED ISSUES ----
      _.each(data, function (issue) {
        issueChartData.push({
          date: issue.date,
          Opened: issue.openCount,
          Closed: issue.closedCount > 0 ? issue.closedCount * -1 : -0.001,
        }); //-0.001 for stack layout to realize it belongs on the bottom
        if (issueScale[1] < issue.openCount) {
          issueScale[1] = issue.openCount;
        }
        if (issueScale[0] > issue.closedCount * -1) {
          issueScale[0] = issue.closedCount * -1;
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
