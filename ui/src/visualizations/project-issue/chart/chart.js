'use strict';

import React from 'react';
import * as d3 from 'd3';

import styles from '../styles.scss';
import _ from 'lodash';

import ViolinPlot from '../../../components/ViolinPlot';
import moment from 'moment';
import cx from 'classnames';
import chroma from 'chroma-js';

export default class ProjectIssue extends React.Component {
  constructor(props) {
    super(props);

    const { commitChartData, commitScale, commitPalette, selectedIssuesCommits } = this.extractCommitData(props);
    const { issueChartData, issueScale, selectedIssues, issueData } = this.extractIssueData(props);

    this.state = {
      issueChartData,
      issueScale,
      issueData,
      commitChartData,
      commitScale,
      commitPalette,
      selectedIssues,
      selectedIssuesCommits
    };
  }

  /**
   * Update computed commit data
   * @param nextProps props that are passed
   */
  componentWillReceiveProps(nextProps) {
    const { commitChartData, commitScale, commitPalette, selectedIssuesCommits } = this.extractCommitData(nextProps);
    const { issueChartData, issueScale, selectedIssues, issueData } = this.extractIssueData(nextProps);

    this.setState({
      issueChartData,
      issueScale,
      issueData,
      commitChartData,
      commitScale,
      commitPalette,
      selectedIssues,
      selectedIssuesCommits
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
          } else if (i === 2) {
            issueChart3 = (
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
        _.each(props.issues, issue => {
          if (issue.closedAt === null) {
            filteredIssues.push(issue);
          }
        });
        break;
      case 'closed':
        _.each(props.issues, issue => {
          if (issue.closedAt) {
            filteredIssues.push(issue);
          }
        });
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
        Opened: 3,
        Closed: -1
      });
      if (issueScale[1] < issue.openCount) {
        issueScale[1] = 3;
      }
      if (issueScale[0] > issue.closedCount * -1) {
        issueScale[0] = -1;
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

  extractCommitData(props) {
    if (!props.commits || props.commits.length === 0) {
      return {};
    }

    //---- STEP 1: AGGREGATE COMMITS GROUPED BY AUTHORS PER TIME INTERVAL ----
    const data = [];
    const granularity = ProjectIssue.getGranularity(props.chartResolution);
    const curr = moment(props.firstSignificantTimestamp).startOf(granularity.unit).subtract(1, props.chartResolution);
    const end = moment(props.lastSignificantTimestamp).endOf(granularity.unit).add(1, props.chartResolution);
    const next = moment(curr).add(1, props.chartResolution);
    const totalChangesPerAuthor = {};
    // TODO: remove?
    // eslint-disable-next-line no-unused-vars
    let totalChanges = 0;
    for (let i = 0; curr.isSameOrBefore(end); curr.add(1, props.chartResolution), next.add(1, props.chartResolution)) {
      //Iterate through time buckets
      const currTimestamp = curr.toDate().getTime();
      const nextTimestamp = next.toDate().getTime();
      const obj = { date: currTimestamp, statsByAuthor: {} }; //Save date of time bucket, create object
      for (; i < props.commits.length && Date.parse(props.commits[i].date) < nextTimestamp; i++) {
        //Iterate through commits that fall into this time bucket
        const additions = props.commits[i].stats.additions;
        const deletions = props.commits[i].stats.deletions;
        const changes = additions + deletions;
        //TODO change to issue-id or issue-name
        const commitAuthor = props.commits[i].signature;
        if (totalChangesPerAuthor[commitAuthor] === null) {
          totalChangesPerAuthor[commitAuthor] = 0;
        }
        totalChangesPerAuthor[commitAuthor] += changes;
        totalChanges += changes;
        if (
          commitAuthor in obj.statsByAuthor //If author is already in statsByAuthor, add to previous values
        ) {
          obj.statsByAuthor[commitAuthor] = {
            count: obj.statsByAuthor[commitAuthor].count + 1,
            additions: obj.statsByAuthor[commitAuthor].additions + additions,
            deletions: obj.statsByAuthor[commitAuthor].deletions + deletions
          };
        } else {
          //Else create new values
          obj.statsByAuthor[commitAuthor] = { count: 1, additions: additions, deletions: deletions };
        }
      }
      data.push(obj);
    }

    //---- STEP 2: CONSTRUCT CHART DATA FROM AGGREGATED COMMITS ----
    const commitChartData = [];
    const commitChartPalette = {};
    const chartIsSplit = props.displayMetric === 'commits';
    if (chartIsSplit) {
      commitChartPalette['(Additions) others'] = props.palette['others'];
      commitChartPalette['(Deletions) others'] = props.palette['others'];
    } else {
      commitChartPalette['others'] = props.palette['others'];
    }
    _.each(data, function(iss) {
      //commit has structure {date, statsByAuthor: {}} (see next line)}
      const obj = { date: iss.date };
      if (chartIsSplit) {
        obj['(Additions) others'] = 0;
        obj['(Deletions) others'] = -0.001;
      } else {
        obj['others'] = 0;
      }
      _.each(props.issues, function(issue) {
        //commitLegend to iterate over authorNames, commitLegend has structure [{name, style}, ...]
        if (issue in iss.statsByAuthor && issue in props.palette) {
          //If committer has data
          if (chartIsSplit) {
            //Insert number of changes with the author name as key,
            //statsByAuthor has structure {{authorName: {count, additions, deletions, changes}}, ...}
            obj['(Additions) ' + issue] = iss.statsByAuthor[issue].additions;
            //-0.001 for stack layout to realize it belongs on the bottom
            obj['(Deletions) ' + issue] = iss.statsByAuthor[issue].deletions * -1 - 0.001;
            commitChartPalette['(Additions) ' + issue] = chroma(props.palette[issue]).hex();
            commitChartPalette['(Deletions) ' + issue] = chroma(props.palette[issue]).darken(0.5).hex();
          } else {
            obj[issue] = iss.statsByAuthor[issue].count;
          }
        } else if (issue in iss.statsByAuthor && !(issue in props.palette)) {
          if (chartIsSplit) {
            obj['(Additions) others'] += iss.statsByAuthor[issue].additions;
            obj['(Deletions) others'] += iss.statsByAuthor[issue].deletions * -1 - 0.001;
          } else {
            obj['others'] += iss.statsByAuthor[issue].additions + iss.statsByAuthor[issue].deletions;
          }
        } else if (issue in props.palette) {
          if (chartIsSplit) {
            obj['(Additions) ' + issue] = 0;
            obj['(Deletions) ' + issue] = -0.001; //-0.001 for stack layout to realize it belongs on the bottom
          } else {
            obj[issue] = 0;
          }
        }
      });
      commitChartData.push(obj); //Add object to list of objects
    });
    //Output in commitChartData has format [{author1: 123, author2: 123, ...}, ...],
    //e.g. series names are the authors with their corresponding values

    //---- STEP 3: SCALING ----
    const commitScale = [0, 0];
    _.each(commitChartData, dataPoint => {
      let positiveTotals = 0;
      let negativeTotals = 0;
      _.each(Object.keys(dataPoint).splice(1), key => {
        if (key.includes('(Additions) ') && props.selectedIssues.indexOf(key.split(') ')[1]) > -1) {
          positiveTotals += dataPoint[key];
        } else if (key.includes('(Deletions) ') && props.selectedIssues.indexOf(key.split(') ')[1]) > -1) {
          negativeTotals += dataPoint[key];
        } else if (props.selectedIssues.indexOf(key) > -1) {
          positiveTotals += dataPoint[key];
        }
      });
      if (positiveTotals > commitScale[1]) {
        commitScale[1] = positiveTotals;
      }
      if (negativeTotals < commitScale[0]) {
        commitScale[0] = negativeTotals;
      }
    });

    //---- STEP 4: FORMATTING FILTERS ----
    const selectedIssues = [];
    const keys = Object.keys(commitChartData[0]).splice(1);

    _.each(keys, key => {
      let concatKey = key;
      if (key.includes('(Additions) ') || key.includes('(Deletions) ')) {
        concatKey = key.split(') ')[1];
      }
      if (props.selectedIssues.indexOf(concatKey) > -1) {
        selectedIssues.push(key);
      }
    });

    return { commitChartData, commitScale, commitPalette: commitChartPalette, selectedIssues };
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
