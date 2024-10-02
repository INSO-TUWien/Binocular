'use strict';

import React from 'react';
import * as d3 from 'd3';

import styles from '../styles.module.scss';
import _ from 'lodash';

import StackedAreaChart from '../../../../components/StackedAreaChart';
import moment from 'moment';
import LegendCompact from '../../../../components/LegendCompact';

export default class CIBuilds extends React.Component {
  constructor(props) {
    super(props);
    const { ciChartData, ciScale } = this.extractCIData(props);

    this.state = {
      ciChartData,
      ciScale,
    };
  }

  /**
   * Update computed commit data
   * @param nextProps props that are passed
   */
  componentWillReceiveProps(nextProps) {
    const { ciChartData, ciScale } = this.extractCIData(nextProps);
    this.setState({
      ciChartData,
      ciScale,
    });
  }

  render() {
    const ciChart = (
      <div className={styles.chartLine}>
        <div className={styles.chart}>
          {this.state.ciChartData !== undefined && this.state.ciChartData.length > 0 ? (
            <StackedAreaChart
              content={this.state.ciChartData}
              palette={{ Succeeded: '#26ca3b', Cancelled: '#aaaaaa', Failed: '#e23b41' }}
              paddings={{ top: 20, left: 60, bottom: 20, right: 30 }}
              xAxisCenter={true}
              yDims={this.state.ciScale}
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
        <LegendCompact text="Succeeded | Failed | Cancelled" color="#26ca3b" color2="#e23b41" color3="#aaaaaa" />
      </div>
    );

    return (
      <div className={styles.chartContainer}>
        {this.state.ciChartData === null && loadingHint}
        {this.state.ciChartData && ciChart}
        {legend}
      </div>
    );
  }

  extractCIData(props) {
    if (!props.builds || props.builds.length === 0) {
      return {};
    }

    let firstTimestamp = props.firstCommitTimestamp;
    let lastTimestamp = props.lastCommitTimestamp;
    let builds = props.builds;

    // explicitly check if the value is false, because in standalone mode, this is undefined.
    //   But then we also want the universal settings to have an effect
    //   if this visualization is part of the dashboard, this value is either true or false
    if (props.universalSettings !== false) {
      builds = props.filteredBuilds;
      firstTimestamp = props.firstSignificantTimestamp;
      lastTimestamp = props.lastSignificantTimestamp;
      builds = builds.filter((build) => {
        // TODO: build.commit is null with gitlab repo
        // if the commit of this build is explicitly excluded, filter this build
        if (build.commit !== null && props.excludeCommits && props.excludedCommits.includes(build.commit.sha)) {
          return false;
        }

        // check if the author of the commit that triggered this build is selected in the universal settings
        let filter = false;
        if (props.selectedAuthors.filter((a) => a === 'others').length > 0) {
          filter = true;
        }
        // for all authors in the universal settings author list
        for (const authorSignature of Object.keys(props.allAuthors)) {
          if (build.commit?.signature === authorSignature) {
            if (props.selectedAuthors.filter((a) => a === authorSignature).length > 0) {
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

    builds = builds.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    //---- STEP 1: AGGREGATE BUILDS PER TIME INTERVAL ----
    const data = [];
    const granularity = this.getGranularity(props.chartResolution);
    const curr = moment(firstTimestamp).startOf(granularity.unit).subtract(1, props.chartResolution);
    const end = moment(lastTimestamp).endOf(granularity.unit).add(1, props.chartResolution);
    const next = moment(curr).add(1, props.chartResolution);
    for (let i = 0; curr.isSameOrBefore(end); curr.add(1, props.chartResolution), next.add(1, props.chartResolution)) {
      //Iterate through time buckets
      const currTimestamp = curr.toDate().getTime();
      const nextTimestamp = next.toDate().getTime();
      const obj = { date: currTimestamp, succeeded: 0, cancelled: 0, failed: 0 }; //Save date of time bucket, create object
      for (; i < builds.length && Date.parse(builds[i].createdAt) < nextTimestamp; i++) {
        //Iterate through commits that fall into this time bucket
        const buildDate = Date.parse(builds[i].createdAt);
        if (buildDate >= currTimestamp && buildDate < nextTimestamp) {
          obj.succeeded += builds[i].stats.success || 0;
          obj.cancelled += builds[i].stats.cancelled || 0;
          obj.failed += builds[i].stats.failed || 0; //-0.001 for stack layout to realize it belongs on the bottom
        }
      }
      data.push(obj);
    }

    //--- STEP 2: CONSTRUCT CHART DATA FROM AGGREGATED BUILDS ----
    const ciChartData = [];
    const ciScale = [0, 0];
    _.each(data, function (build) {
      ciChartData.push({
        date: build.date,
        Succeeded: build.succeeded,
        Failed: build.failed > 0 ? build.failed * -1 : 0,
        Cancelled: build.cancelled > 0 ? build.cancelled * -1 : 0,
      });
      if (ciScale[1] < build.succeeded) {
        ciScale[1] = build.succeeded;
      }
      if (ciScale[0] > (build.failed + build.cancelled) * -1) {
        ciScale[0] = (build.failed + build.cancelled) * -1;
      }
    });

    return { ciChartData, ciScale };
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
