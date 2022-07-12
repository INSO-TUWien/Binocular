'use strict';

import React from 'react';
import * as d3 from 'd3';

import styles from '../styles.scss';
import _ from 'lodash';

import StackedAreaChart from '../../../../components/StackedAreaChart';
import moment from 'moment';
import chroma from 'chroma-js';

export default class Changes extends React.Component {
  constructor(props) {
    super(props);

    const { commitChartData, commitScale, commitPalette, selectedAuthors } = this.extractCommitData(props);
    this.state = {
      commitChartData, //Data for commit changes
      commitScale, //Maximum change in commit changes graph, used for y-axis scaling
      commitPalette,
      selectedAuthors,
    };
  }

  /**
   * Update computed commit data
   * @param nextProps props that are passed
   */
  componentWillReceiveProps(nextProps) {
    const { commitChartData, commitScale, commitPalette, selectedAuthors } = this.extractCommitData(nextProps);
    this.setState({
      commitChartData,
      commitScale,
      commitPalette,
      selectedAuthors,
    });
  }

  render() {
    let commitOffset, commitPalette, commitCenterAxis, commitOrder;
    if (this.props.palette) {
      commitOrder = Object.keys(this.props.palette);
    }
    if (this.props.displayMetric === 'linesChanged') {
      commitOffset = d3.stackOffsetDiverging;
      commitPalette = this.state.commitPalette;
      commitCenterAxis = true;
    } else {
      commitOffset = d3.stackOffsetNone;
      commitPalette = this.props.palette;
      commitCenterAxis = false;
    }

    const commitChart = (
      <div className={styles.chartLine}>
        <div className={styles.chart}>
          <StackedAreaChart
            content={this.state.commitChartData}
            palette={commitPalette}
            paddings={{ top: 20, left: 60, bottom: 20, right: 30 }}
            xAxisCenter={commitCenterAxis}
            yDims={this.state.commitScale}
            d3offset={commitOffset}
            keys={this.state.selectedAuthors}
            resolution={this.props.chartResolution}
            displayNegative={true}
            order={commitOrder}
          />
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
        {this.state.commitChartData === null && loadingHint}
        {this.state.commitChartData && commitChart}
      </div>
    );
  }

  extractCommitData(props) {
    if (!props.commits || props.commits.length === 0) {
      return {};
    }

    //---- STEP 1: AGGREGATE COMMITS GROUPED BY AUTHORS PER TIME INTERVAL ----
    const data = [];
    //let granularity = Dashboard.getGranularity(props.resolution);
    const granularity = this.getGranularity(props.chartResolution);
    const curr = moment(props.firstSignificantTimestamp).startOf(granularity.unit).subtract(1, props.chartResolution);
    const end = moment(props.lastSignificantTimestamp).endOf(granularity.unit).add(1, props.chartResolution);
    const next = moment(curr).add(1, props.chartResolution);
    const totalChangesPerAuthor = {};
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
        const commitAuthor = props.commits[i].signature;
        if (totalChangesPerAuthor[commitAuthor] === null) {
          totalChangesPerAuthor[commitAuthor] = 0;
        }
        totalChangesPerAuthor[commitAuthor] += changes;
        if (
          commitAuthor in obj.statsByAuthor //If author is already in statsByAuthor, add to previous values
        ) {
          obj.statsByAuthor[commitAuthor] = {
            count: obj.statsByAuthor[commitAuthor].count + 1,
            additions: obj.statsByAuthor[commitAuthor].additions + additions,
            deletions: obj.statsByAuthor[commitAuthor].deletions + deletions,
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
    const chartIsSplit = props.displayMetric === 'linesChanged';
    if (chartIsSplit) {
      commitChartPalette['(Additions) others'] = props.palette['others'];
      commitChartPalette['(Deletions) others'] = props.palette['others'];
    } else {
      commitChartPalette['others'] = props.palette['others'];
    }
    _.each(data, function (commit) {
      //commit has structure {date, statsByAuthor: {}} (see next line)}
      const obj = { date: commit.date };
      if (chartIsSplit) {
        obj['(Additions) others'] = 0;
        obj['(Deletions) others'] = -0.001;
      } else {
        obj['others'] = 0;
      }
      _.each(props.committers, function (committer) {
        //commitLegend to iterate over authorNames, commitLegend has structure [{name, style}, ...]
        if (committer in commit.statsByAuthor && committer in props.palette) {
          //If committer has data
          if (chartIsSplit) {
            //Insert number of changes with the author name as key,
            //statsByAuthor has structure {{authorName: {count, additions, deletions, changes}}, ...}
            obj['(Additions) ' + committer] = commit.statsByAuthor[committer].additions;
            //-0.001 for stack layout to realize it belongs on the bottom
            obj['(Deletions) ' + committer] = commit.statsByAuthor[committer].deletions * -1 - 0.001;
            commitChartPalette['(Additions) ' + committer] = chroma(props.palette[committer]).hex();
            commitChartPalette['(Deletions) ' + committer] = chroma(props.palette[committer]).darken(0.5).hex();
          } else {
            obj[committer] = commit.statsByAuthor[committer].count;
          }
        } else if (committer in commit.statsByAuthor && !(committer in props.palette)) {
          if (chartIsSplit) {
            obj['(Additions) others'] += commit.statsByAuthor[committer].additions;
            obj['(Deletions) others'] += commit.statsByAuthor[committer].deletions * -1 - 0.001;
          } else {
            obj['others'] += commit.statsByAuthor[committer].additions + commit.statsByAuthor[committer].deletions;
          }
        } else if (committer in props.palette) {
          if (chartIsSplit) {
            obj['(Additions) ' + committer] = 0;
            obj['(Deletions) ' + committer] = -0.001; //-0.001 for stack layout to realize it belongs on the bottom
          } else {
            obj[committer] = 0;
          }
        }
      });
      commitChartData.push(obj); //Add object to list of objects
    });
    //Output in commitChartData has format [{author1: 123, author2: 123, ...}, ...],
    //e.g. series names are the authors with their corresponding values

    //---- STEP 3: SCALING ----
    const commitScale = [0, 0];
    _.each(commitChartData, (dataPoint) => {
      let positiveTotals = 0;
      let negativeTotals = 0;
      _.each(Object.keys(dataPoint).splice(1), (key) => {
        if (key.includes('(Additions) ') && props.selectedAuthors.indexOf(key.split(') ')[1]) > -1) {
          positiveTotals += dataPoint[key];
        } else if (key.includes('(Deletions) ') && props.selectedAuthors.indexOf(key.split(') ')[1]) > -1) {
          negativeTotals += dataPoint[key];
        } else if (props.selectedAuthors.indexOf(key) > -1) {
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
    const selectedAuthors = [];
    const keys = Object.keys(commitChartData[0]).splice(1);

    _.each(keys, (key) => {
      let concatKey = key;
      if (key.includes('(Additions) ') || key.includes('(Deletions) ')) {
        concatKey = key.split(') ')[1];
      }
      if (props.selectedAuthors.indexOf(concatKey) > -1) {
        selectedAuthors.push(key);
      }
    });

    return { commitChartData, commitScale, commitPalette: commitChartPalette, selectedAuthors };
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
