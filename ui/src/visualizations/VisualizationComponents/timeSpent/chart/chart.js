'use strict';

import React from 'react';
import * as d3 from 'd3';

import styles from '../styles.scss';

import StackedAreaChart from '../../../../components/StackedAreaChart';
import moment from 'moment';
import _ from 'lodash';

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
                    <div style={{ display: 'inline-block' }}>{this.convertToTimeString(this.state.aggregatedDataPerAuthor[author])}</div>
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

    let firstTimestamp = props.firstIssueTimestamp;
    let lastTimestamp = props.lastIssueTimestamp;
    const issues = props.issues;
    const mergeRequests = props.mergeRequests;
    const timeSpentChartData = [];
    const timeSpentScale = [0, 0];
    if (props.universalSettings) {
      //issues = props.filteredIssues;
      //mergeRequests = props.filteredMergeRequests;
      firstTimestamp = props.firstSignificantTimestamp;
      lastTimestamp = props.lastSignificantTimestamp;
    }
    const aggregatedDataPerAuthor = {};
    let aggregatedTimeSpent = 0;
    if (issues.length > 0) {
      //---- STEP 1: FILTER ISSUES ----
      const filteredIssues = issues;
      const filteredMergeRequests = mergeRequests;
      const selectedAuthorNames = _.uniq(props.selectedAuthors.map((sA) => sA.split('<')[0].slice(0, -1)));

      //---- STEP 2: AGGREGATE TIME PER TIME INTERVAL ----
      const granularity = this.getGranularity(props.chartResolution);
      const curr = moment(firstTimestamp).startOf(granularity.unit).subtract(1, props.chartResolution);
      const next = moment(curr).add(1, props.chartResolution);

      const end = moment(lastTimestamp).endOf(granularity.unit).add(1, props.chartResolution);
      const data = [];

      const timeTrakingData = [];
      selectedAuthorNames.forEach((sA) => {
        aggregatedDataPerAuthor[sA] = 0;
      });

      filteredIssues.forEach((issue) => {
        if (issue.notes !== undefined && issue.notes !== null) {
          issue.notes.forEach((note) => {
            const timeAddedNote = /^added ([0-9a-z ]+) of time spent.*?$/.exec(note.body);
            const timeSubtractedNote = /^subtracted ([0-9a-z ]+) of time spent.*?$/.exec(note.body);
            const timeDeletedNote = /^deleted ([0-9a-z ]+) of spent time.*?$/.exec(note.body);

            if (timeAddedNote) {
              timeTrakingData.push({
                authorName: note.author.name,
                timeSpent: this.convertTime(timeAddedNote[1]) / 3600,
                createdAt: note.created_at,
              });
            } else if (timeSubtractedNote) {
              timeTrakingData.push({
                authorName: note.author.name,
                timeSpent: -this.convertTime(timeSubtractedNote[1]) / 3600,
                createdAt: note.created_at,
              });
            } else if (timeDeletedNote) {
              timeTrakingData.push({
                authorName: note.author.name,
                timeSpent: -this.convertTime(timeDeletedNote[1]) / 3600,
                createdAt: note.created_at,
              });
            }
          });
        }
      });

      filteredMergeRequests.forEach((mergeRequest) => {
        if (mergeRequest.notes !== undefined && mergeRequest.notes !== null) {
          mergeRequest.notes.forEach((note) => {
            const timeAddedNote = /^added ([0-9a-z ]+) of time spent.*?$/.exec(note.body);
            const timeSubtractedNote = /^subtracted ([0-9a-z ]+) of time spent.*?$/.exec(note.body);
            const timeDeletedNote = /^deleted ([0-9a-z ]+) of spent time.*?$/.exec(note.body);

            if (timeAddedNote) {
              timeTrakingData.push({
                authorName: note.author.name,
                timeSpent: this.convertTime(timeAddedNote[1]) / 3600,
                createdAt: note.created_at,
              });
            } else if (timeSubtractedNote) {
              timeTrakingData.push({
                authorName: note.author.name,
                timeSpent: -this.convertTime(timeSubtractedNote[1]) / 3600,
                createdAt: note.created_at,
              });
            } else if (timeDeletedNote) {
              timeTrakingData.push({
                authorName: note.author.name,
                timeSpent: -this.convertTime(timeDeletedNote[1]) / 3600,
                createdAt: note.created_at,
              });
            }
          });
        }
      });

      for (; curr.isSameOrBefore(end); curr.add(1, props.chartResolution), next.add(1, props.chartResolution)) {
        //Iterate through time buckets
        const currTimestamp = curr.toDate().getTime();
        const nextTimestamp = next.toDate().getTime();
        const relevantNotes = timeTrakingData.filter(
          (entry) => Date.parse(entry.createdAt) >= currTimestamp && Date.parse(entry.createdAt) < nextTimestamp
        );

        const dataEntry = {
          data: { date: currTimestamp },
          dataAggregated: { date: currTimestamp },
          aggregatedTimeMax: 0,
          aggregatedTimeMin: 0,
          aggregatedTimeAllAuthors: 0,
        };

        const committersDone = [];

        props.mergedAuthors.forEach((author) => {
          const authorName = author.mainCommitter.split('<')[0].slice(0, -1);
          author.committers.forEach((committer) => {
            const committerName = committer.signature.split('<')[0].slice(0, -1);
            if (!committersDone.includes(committerName)) {
              committersDone.push(committerName);
              relevantNotes
                .filter((note) => note.authorName === committerName)
                .forEach((note) => {
                  aggregatedDataPerAuthor[authorName] += note.timeSpent;
                  dataEntry.data[authorName] = note.timeSpent;
                  dataEntry.dataAggregated[authorName] = aggregatedDataPerAuthor[authorName];
                });
            }
          });
        });

        selectedAuthorNames.forEach((sA) => {
          if (dataEntry.data[sA] === undefined) {
            dataEntry.data[sA] = 0;
            dataEntry.dataAggregated[sA] = aggregatedDataPerAuthor[sA];
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
        if (props.aggregateTime) {
          timeSpentChartData.push(dataEntry.dataAggregated);
          if (dataEntry.aggregatedTimeAllAuthors > timeSpentScale[1]) {
            timeSpentScale[1] = dataEntry.aggregatedTimeAllAuthors;
          }
        } else {
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
      if (palette[authorName] === undefined) {
        palette[authorName] = allAuthors[author];
      }
    });
    return palette;
  }

  convertToTimeString(hours) {
    return parseInt(hours) + 'h ' + Math.round(((60 * (hours % 1) + Number.EPSILON) * 100) / 100) + 'min';
  }
}
