'use strict';

import React from 'react';
import * as d3 from 'd3';

import styles from '../styles.scss';
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
            <div>No Data Available</div>
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

    let firstTimestamp = props.firstCommitTimestamp;
    let lastTimestamp = props.lastCommitTimestamp;
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

      if (props.universalSettings) {
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
      let createdDate = Date.parse(issues[0].createdAt);
      for (let i = 0, j = 0; curr.isSameOrBefore(end); curr.add(1, props.chartResolution), next.add(1, props.chartResolution)) {
        //Iterate through time buckets
        const currTimestamp = curr.toDate().getTime();
        const nextTimestamp = next.toDate().getTime();

        const obj = { date: currTimestamp, count: 0, openCount: 0, closedCount: 0 }; //Save date of time bucket, create object

        while (i < filteredIssues.length && createdDate < nextTimestamp && createdDate >= currTimestamp) {
          //Iterate through issues that fall into this time bucket (open date)
          if (createdDate > currTimestamp && createdDate < nextTimestamp) {
            obj.count++;
            obj.openCount++;
          }
          if (filteredIssues[i].closedAt) {
            //If issues are closed, save close date in sorted list
            const closedDate = Date.parse(filteredIssues[i].closedAt);
            const insertPos = _.sortedIndex(sortedCloseDates, closedDate);
            sortedCloseDates.splice(insertPos, 0, closedDate);
          }
          if (++i < filteredIssues.length) {
            createdDate = Date.parse(filteredIssues[i].createdAt);
          }
        }
        for (; j < sortedCloseDates.length && sortedCloseDates[j] < nextTimestamp && sortedCloseDates[j] >= currTimestamp; j++) {
          //Iterate through issues that fall into this time bucket (closed date)
          if (sortedCloseDates[j] > currTimestamp && sortedCloseDates[j] < nextTimestamp) {
            sortedCloseDates.splice(j, 1);
            obj.count++;
            obj.closedCount++;
          }
        }
        data.push(obj);
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
