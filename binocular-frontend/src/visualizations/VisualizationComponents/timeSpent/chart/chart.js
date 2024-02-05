'use strict';

import React from 'react';
import * as d3 from 'd3';

import styles from '../styles.module.scss';

import StackedAreaChart from '../../../../components/StackedAreaChart';
import moment from 'moment';
import _ from 'lodash';

import { convertToTimeString, extractTimeTrackingDataFromNotes } from '../../../../utils/timeTracking';

// the chart cant deal with 0 values
const stackedAreaChartMinValue = 0.001;

export default class TimeSpentChart extends React.Component {
  constructor(props) {
    super(props);
    const { timeSpentChartData, timeSpentScale, aggregatedDataPerAuthor, aggregatedTimeSpent } = this.extractTimeData(props);
    this.state = {
      timeSpentChartData,
      timeSpentScale,
      aggregatedDataPerAuthor,
      aggregatedTimeSpent,
    };
  }

  /**
   * Update computed commit data
   * @param nextProps props that are passed
   */
  componentWillReceiveProps(nextProps) {
    const { timeSpentChartData, timeSpentScale, aggregatedDataPerAuthor, aggregatedTimeSpent } = this.extractTimeData(nextProps);

    this.setState({
      timeSpentChartData,
      timeSpentScale,
      aggregatedDataPerAuthor,
      aggregatedTimeSpent,
    });
  }

  render() {
    const palette = this.generatePalette(this.props.mergedAuthors);
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

    const currentAbsoluteTimeDistribution = (
      <div className={styles.secondaryChart}>
        <div>Absolute Time Distribution:</div>
        <div className={styles.stackedBarChart}>
          {this.state.aggregatedDataPerAuthor !== undefined &&
            Object.keys(this.state.aggregatedDataPerAuthor).map((author) => {
              const percentContribution = (100.0 / this.state.aggregatedTimeSpent) * this.state.aggregatedDataPerAuthor[author];
              if (percentContribution > 0) {
                return (
                  <div
                    key={author}
                    className={styles.stackedBarChartBlock}
                    style={{
                      width: '' + percentContribution + '%',
                      background: palette[author],
                    }}>
                    <div style={{ display: 'block', textDecoration: 'underline', fontWeight: 'bold' }}>{author}:</div>
                    <div style={{ display: 'inline-block' }}>{Math.round((percentContribution + Number.EPSILON) * 10) / 10}%</div>
                    <div style={{ display: 'inline-block' }}>{convertToTimeString(this.state.aggregatedDataPerAuthor[author])}</div>
                  </div>
                );
              } else {
                return '';
              }
            })}
        </div>
      </div>
    );

    return (
      <div className={styles.chartContainer}>
        {this.state.timeSpentChartData === undefined && loadingHint}
        {this.state.timeSpentChartData !== undefined && timeChart}
        {this.state.timeSpentChartData !== undefined && currentAbsoluteTimeDistribution}
      </div>
    );
  }

  extractTimeData(props) {
    if (!props.issues || props.issues.length === 0) {
      return {};
    }

    let firstTimestamp = null;
    let lastTimestamp = null;
    const issues = props.issues;
    const mergeRequests = props.mergeRequests;
    const timeSpentChartData = [];
    const timeSpentScale = [0, 0];

    const aggregatedDataPerAuthor = {};
    let aggregatedTimeSpent = 0;
    if (issues.length > 0) {
      //---- STEP 1: FILTER ISSUES ----
      const filteredIssues = issues;
      const filteredMergeRequests = mergeRequests;
      const selectedAuthorNames = _.uniq(props.selectedAuthors.map((sA) => sA.split('<')[0].slice(0, -1)));

      //---- STEP 2: AGGREGATE TIME PER TIME INTERVAL ----
      const timeTrackingData = [];
      selectedAuthorNames.forEach((sA) => {
        aggregatedDataPerAuthor[sA] = 0;
      });

      filteredIssues.forEach((issue) => {
        timeTrackingData.push(...extractTimeTrackingDataFromNotes(issue.notes));
      });

      filteredMergeRequests.forEach((mergeRequest) => {
        timeTrackingData.push(...extractTimeTrackingDataFromNotes(mergeRequest.notes));
      });

      const timetrackingTimestamps = timeTrackingData.map((ttd) => {
        return new Date(ttd.createdAt).getTime();
      });

      // explicitly check if the value is false, because in standalone mode, this is undefined.
      //   But then we also want the universal settings to have an effect
      // if this visualization is part of the dashboard, this value is either true or false
      if (props.universalSettings !== false) {
        // if universal settings should be considered, take the timeframe from there
        firstTimestamp = props.firstSignificantTimestamp;
        lastTimestamp = props.lastSignificantTimestamp;
      } else {
        // else, default to the first and last time that some time was tracked
        firstTimestamp = Math.min(...timetrackingTimestamps);
        lastTimestamp = Math.max(...timetrackingTimestamps);
      }

      const granularity = this.getGranularity(props.chartResolution);

      const curr = moment(firstTimestamp).startOf(granularity.unit).subtract(1, props.chartResolution);
      const next = moment(curr).add(1, props.chartResolution);

      // the visualization should include the whle bucked of the last timetracking.
      // So if the last timestracking was done on the first of January and the granularity is month,
      // the last bucket should be the whole month of january
      const end = moment(lastTimestamp).endOf(granularity.unit).add(1, props.chartResolution);
      const data = [];

      for (; curr.isSameOrBefore(end); curr.add(1, props.chartResolution), next.add(1, props.chartResolution)) {
        //Iterate through time buckets
        const currTimestamp = curr.toDate().getTime();
        const nextTimestamp = next.toDate().getTime();

        // all time-spent notes that are in this time bucket
        const relevantNotes = timeTrackingData.filter(
          (entry) => Date.parse(entry.createdAt) >= currTimestamp && Date.parse(entry.createdAt) < nextTimestamp,
        );

        const dataEntry = {
          data: { date: currTimestamp },
          dataAggregated: { date: currTimestamp },
          aggregatedTimeMax: 0,
          aggregatedTimeMin: 0,
          aggregatedTimeAllAuthors: 0,
        };

        const committersDone = [];

        // for every selected author
        props.mergedAuthors.forEach((author) => {
          const authorName = author.mainCommitter.split('<')[0].slice(0, -1);

          // if this author has already been processed, continue with the next one
          if (committersDone.includes(authorName)) {
            return;
          }

          // the stacked area chart cannot deal with 0 values
          dataEntry.data[authorName] = stackedAreaChartMinValue;

          // initialize the current aggregated value with the one from the last bucket
          // TODO: when this line is removed, it re-renders correctly when the aggregate switch is clicked.
          // Theory: because without this line some fields are missing (when an author does not commit one week,
          //         react realizes that the object is different and re-renders
          dataEntry.dataAggregated[authorName] = aggregatedDataPerAuthor[authorName];

          // for all pseudonyms of this author
          author.committers.forEach((committer) => {
            const committerName = committer.signature.split('<')[0].slice(0, -1);

            // only process the first one
            if (!committersDone.includes(authorName)) {
              relevantNotes
                .filter((note) => note.authorName.includes(committerName))
                .forEach((note) => {
                  committersDone.push(authorName);
                  aggregatedDataPerAuthor[authorName] += note.timeSpent;
                  dataEntry.data[authorName] += note.timeSpent;
                  dataEntry.dataAggregated[authorName] = aggregatedDataPerAuthor[authorName];
                });
            }
          });
        });

        selectedAuthorNames.forEach((sA) => {
          if (dataEntry.data[sA] === undefined) {
            dataEntry.data[sA] = stackedAreaChartMinValue;
          }
          if (dataEntry.data[sA] >= 0) {
            dataEntry.aggregatedTimeMax += dataEntry.data[sA];
          } else {
            dataEntry.aggregatedTimeMin += dataEntry.data[sA];
          }

          dataEntry.aggregatedTimeAllAuthors += aggregatedDataPerAuthor[sA];
        });

        data.push(dataEntry);
      }

      //---- STEP 3: CONSTRUCT CHART DATA FROM AGGREGATED Time ----
      data.forEach((dataEntry) => {
        // if we want to display the aggregated time per author
        if (props.aggregateTime) {
          // ignore empty data points
          if (Object.keys(dataEntry.dataAggregated).length <= 1) return;
          timeSpentChartData.push(dataEntry.dataAggregated);
          if (dataEntry.aggregatedTimeAllAuthors > timeSpentScale[1]) {
            timeSpentScale[1] = dataEntry.aggregatedTimeAllAuthors;
          }
        } else {
          // else we want to display the time spent per time bucket
          // ignore empty data points
          if (Object.keys(dataEntry.data).length <= 1) return;
          timeSpentChartData.push(dataEntry.data);
          if (dataEntry.aggregatedTimeMax > timeSpentScale[1]) {
            timeSpentScale[1] = dataEntry.aggregatedTimeMax;
          }
          if (dataEntry.aggregatedTimeMin < timeSpentScale[0]) {
            timeSpentScale[0] = dataEntry.aggregatedTimeMin;
          }
        }
        if (dataEntry.aggregatedTimeAllAuthors > aggregatedTimeSpent) {
          aggregatedTimeSpent = dataEntry.aggregatedTimeAllAuthors;
        }
      });
    }

    return { timeSpentChartData, timeSpentScale, aggregatedDataPerAuthor, aggregatedTimeSpent };
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

  generatePalette(mergedAuthors) {
    const palette = {};
    mergedAuthors.forEach((author) => {
      const authorName = author.mainCommitter.split('<')[0].slice(0, -1);
      if (palette[authorName] === undefined) {
        palette[authorName] = author.color;
      }
    });
    return palette;
  }
}
