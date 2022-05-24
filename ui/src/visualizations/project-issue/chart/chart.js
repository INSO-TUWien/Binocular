'use strict';

import React from 'react';
import * as d3 from 'd3';

import styles from '../styles.scss';
import _ from 'lodash';

import ViolinPlot from '../../../components/ViolinPlot';
import moment from 'moment';
import cx from 'classnames';

export default class ProjectIssue extends React.Component {
  constructor(props) {
    super(props);

    const { issueChartData, issueScale, selectedIssues, issueData } = this.extractIssueData(props);

    this.state = {
      issueChartData,
      issueScale,
      issueData,
      selectedIssues
    };
  }

  /**
   * Update computed commit data
   * @param nextProps props that are passed
   */
  componentWillReceiveProps(nextProps) {
    const { issueChartData, issueScale, selectedIssues, issueData } = this.extractIssueData(nextProps);

    this.setState({
      issueChartData,
      issueScale,
      issueData,
      selectedIssues
    });
  }

  render() {
    let chartTitle = 'Issues';
    let issueChart1, issueChart2, issueChart3;

    if (this.state.selectedIssues && this.state.issueData) {
      const issueDataLength = this.state.issueData.length;
      if (issueDataLength) {
        for (let i = 0; i < this.state.selectedIssues.length && i <= 3; i++) {
          chartTitle = this.state.issueData[i].title;
          if (i === 0) {
            issueChart1 = (
              <div className={styles.chartLine}>
                <div className={cx(styles.text, 'label')}>
                  {chartTitle}
                </div>
                <div className={styles.chart}>
                  <ViolinPlot
                    content={this.state.issueChartData}
                    palette={{ Opened: '#3461eb', Closed: '#8099e8' }}
                    paddings={{ top: 20, left: 60, bottom: 20, right: 30 }}
                    xAxisCenter={true}
                    yDims={this.state.issueScale}
                    d3offset={d3.stackOffsetDiverging}
                    resolution={this.props.chartResolution}
                  />
                </div>
              </div>
            );
          } else if (i === 1) {
            issueChart2 = (
              <div className={styles.chartLine}>
                <div className={cx(styles.text, 'label')}>
                  {chartTitle}
                </div>
                <div className={styles.chart}>
                  <ViolinPlot
                    content={this.state.issueChartData}
                    palette={{ Opened: '#35631BC8', Closed: '#5CC71EC8' }}
                    paddings={{ top: 20, left: 60, bottom: 20, right: 30 }}
                    xAxisCenter={true}
                    yDims={this.state.issueScale}
                    d3offset={d3.stackOffsetDiverging}
                    resolution={this.props.chartResolution}
                  />
                </div>
              </div>
            );
          } else if (i === 2) {
            issueChart3 = (
              <div className={styles.chartLine}>
                <div className={cx(styles.text, 'label')}>
                  {chartTitle}
                </div>
                <div className={styles.chart}>
                  <ViolinPlot
                    content={this.state.issueChartData}
                    palette={{ Opened: '#753E2CFF', Closed: '#C56D2EFF' }}
                    paddings={{ top: 20, left: 60, bottom: 20, right: 30 }}
                    xAxisCenter={true}
                    yDims={this.state.issueScale}
                    d3offset={d3.stackOffsetDiverging}
                    resolution={this.props.chartResolution}
                  />
                </div>
              </div>
            );
          }
        }
      }
    }

    const loadingHint = (
      <div className={styles.loadingHintContainer}>
        <h1 className={styles.loadingHint}>
          Loading... <i className="fas fa-spinner fa-pulse" />
        </h1>
      </div>
    );

    const selectChartHint = (
      <div className={styles.loadingHintContainer}>
        <h1 className={styles.loadingHint}>Please select a chart.</h1>
      </div>
    );

    return (
      <div className={styles.chartContainer}>
        {this.state.issueChartData === null && loadingHint}
        {!this.props.showStandardChart && selectChartHint}
        {this.state.issueChartData && this.props.showStandardChart && issueChart1}
        {this.state.issueChartData && this.props.showStandardChart && issueChart2}
        {this.state.issueChartData && this.props.showStandardChart && issueChart3}
      </div>
    );
  }

  extractIssueData(props) {
    if (!props.issues || props.issues.length === 0) {
      return {};
    }

    //---- STEP 1: FILTER ISSUES ----
    let filteredIssues = [];
    switch (props.showIssues) {
      case 'all':
        filteredIssues = props.issues;
        break;
      case 'open':
        /*_.each(props.issues, issue => {
          if (issue.closedAt === null) {
            filteredIssues.push(issue);
          }
        });*/
        filteredIssues = props.issues;
        break;
      case 'closed':
        /*_.each(props.issues, issue => {
          if (issue.closedAt) {
            filteredIssues.push(issue);
          }
        });
         */
        filteredIssues = props.issues;
        break;
      default:
    }

    //---- STEP 2: AGGREGATE ISSUES PER TIME INTERVAL ----
    const data = [];
    const granularity = ProjectIssue.getGranularity(props.chartResolution);
    const curr = moment(props.firstSignificantTimestamp).startOf(granularity.unit).subtract(1, props.chartResolution);
    const next = moment(curr).add(1, props.chartResolution);
    const end = moment(props.lastSignificantTimestamp).endOf(granularity.unit).add(1, props.chartResolution);
    const sortedCloseDates = [];
    let createdDate = Date.parse(props.issues[0].createdAt);

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
    const issueChartData = [];
    const issueScale = [0, 0];
    _.each(data, function(issue) {
      issueChartData.push({
        date: issue.date,
        Opened: issue.openCount > 0 ? issue.openCount : 0.1,
        Closed: issue.closedCount > 0 ? issue.closedCount * -1 : -0.01
      });
      if (issueScale[1] < issue.openCount) {
        issueScale[1] = issue.openCount;
      }
      if (issueScale[0] > issue.closedCount * -1) {
        issueScale[0] = issue.closedCount * -1;
      }
    });

    //---- STEP 4: FORMATTING FILTERS AND CONSTRUCT NEW ISSUE DATA----
    const selectedIssues = [];
    const keys = props.selectedIssues;
    _.each(keys, key => {
      if (props.selectedIssues.indexOf(key) > -1) {
        selectedIssues.push(key);
      }
    });

    //---- STEP 5: CONSTRUCT NEW ISSUE DATA ----
    const issueData = [];
    _.each(filteredIssues, function(issue) {
      if (props.selectedIssues.indexOf(issue.title) > -1) {
        issueData.push({
          title: issue.title,
          createdAt: issue.createdAt,
          closedAt: issue.closedAt
        });
      }
    });

    return { issueChartData, issueScale, selectedIssues, issueData };
  }

  static getGranularity(resolution) {
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
