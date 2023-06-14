'use strict';

import React from 'react';
import * as d3 from 'd3';

import styles from '../styles.scss';

import StackedAreaChart from '../../../../components/StackedAreaChart';
import moment from 'moment';
import LegendCompact from '../../../../components/LegendCompact';
export default class TimeSpentChart extends React.Component {
  constructor(props) {
    super(props);
    const { timeSpentChartData, timeSpentScale } = this.extractTimeData(props);
    this.state = {
      timeSpentChartData,
      timeSpentScale,
    };
  }

  /**
   * Update computed commit data
   * @param nextProps props that are passed
   */
  componentWillReceiveProps(nextProps) {
    const { timeSpentChartData, timeSpentScale } = this.extractTimeData(nextProps);

    this.setState({
      timeSpentChartData,
      timeSpentScale,
    });
  }

  render() {
    const palette = this.generatePalette(this.props.allAuthors);
    const timeChart = (
      <div className={styles.chartLine}>
        <div className={styles.chart}>
          {this.state.timeSpentChartData !== undefined && this.state.timeSpentChartData.length > 0 ? (
            <StackedAreaChart
              content={this.state.timeSpentChartData}
              palette={palette}
              paddings={{ top: 20, left: 60, bottom: 20, right: 30 }}
              xAxisCenter={true}
              yDims={this.state.timeSpentScale}
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
    return (
      <div className={styles.chartContainer}>
        {this.state.timeSpentChartData === null && loadingHint}
        {timeChart}
      </div>
    );
  }

  extractTimeData(props) {
    if (!props.issues || props.issues.length === 0) {
      return {};
    }

    let firstTimestamp = props.firstIssueTimestamp;
    let lastTimestamp = props.lastIssueTimestamp;
    let issues = props.issues;

    const timeSpentChartData = [];
    const timeSpentScale = [0, 0];
    if (props.universalSettings) {
      issues = props.filteredIssues;
      firstTimestamp = props.firstSignificantTimestamp;
      lastTimestamp = props.lastSignificantTimestamp;
    }

    if (issues.length > 0) {
      //---- STEP 1: FILTER ISSUES ----
      let filteredIssues = issues;
      const selectedAuthorNames = props.selectedAuthors.map((sA) => sA.split('<')[0].slice(0, -1));
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

      //---- STEP 2: AGGREGATE TIME PER TIME INTERVAL ----
      const granularity = this.getGranularity(props.chartResolution);
      const curr = moment(firstTimestamp).startOf(granularity.unit).subtract(1, props.chartResolution);
      const next = moment(curr).add(1, props.chartResolution);
      const end = moment(lastTimestamp).endOf(granularity.unit).add(1, props.chartResolution);
      const data = [];

      const timeTrakingData = [];

      filteredIssues.forEach((issue) => {
        issue.notes.forEach((note) => {
          const timeNote = /^added ([1-9a-z ]+) of time spent$/.exec(note.body);
          if (timeNote) {
            timeTrakingData.push({
              authorName: note.author.name,
              timeSpent: this.convertTime(timeNote[1]) / 3600,
              createdAt: note.created_at,
            });
          }
        });
      });
      for (; curr.isSameOrBefore(end); curr.add(1, props.chartResolution), next.add(1, props.chartResolution)) {
        //Iterate through time buckets
        const currTimestamp = curr.toDate().getTime();
        const nextTimestamp = next.toDate().getTime();
        const relevantNotes = timeTrakingData.filter(
          (entry) => Date.parse(entry.createdAt) >= currTimestamp && Date.parse(entry.createdAt) < nextTimestamp
        );

        const dataEntry = { data: { date: currTimestamp }, aggregatedTime: 0 };
        relevantNotes.forEach((note) => {
          dataEntry.data[note.authorName] = note.timeSpent;
          dataEntry.aggregatedTime += note.timeSpent;
        });
        selectedAuthorNames.forEach((sA) => {
          if (dataEntry.data[sA] === undefined) {
            dataEntry.data[sA] = 0;
          }
        });
        data.push(dataEntry);
      }
      //---- STEP 3: CONSTRUCT CHART DATA FROM AGGREGATED Time ----
      data.forEach((dataEntry) => {
        timeSpentChartData.push(dataEntry.data);
        if (dataEntry.aggregatedTime > timeSpentScale[1]) {
          timeSpentScale[1] = dataEntry.aggregatedTime;
        }
      });
    }
    return { timeSpentChartData, timeSpentScale };
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

  convertTime(timeString) {
    const timeParts = timeString.split(' ');
    let time = 0;
    timeParts.forEach((part) => {
      if (part.endsWith('h')) {
        time += parseInt(part.substring(0, part.length - 1)) * 60 * 60;
      }
      if (part.endsWith('m')) {
        time += parseInt(part.substring(0, part.length - 1)) * 60;
      }
      if (part.endsWith('2')) {
        time += parseInt(part.substring(0, part.length - 1));
      }
    });
    return time;
  }

  generatePalette(allAuthors) {
    const palette = {};
    Object.keys(allAuthors).forEach((author) => {
      const authorName = author.split('<')[0].slice(0, -1);
      palette[authorName] = allAuthors[author];
    });
    return palette;
  }
}
