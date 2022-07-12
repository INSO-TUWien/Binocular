'use strict';

import React from 'react';
import * as d3 from 'd3';

import styles from '../styles.scss';
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
          <StackedAreaChart
            content={this.state.ciChartData}
            palette={{ Succeeded: '#26ca3b', Failed: '#e23b41' }}
            paddings={{ top: 20, left: 60, bottom: 20, right: 30 }}
            xAxisCenter={true}
            yDims={this.state.ciScale}
            d3offset={d3.stackOffsetDiverging}
            resolution={this.props.chartResolution}
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

    const legend = (
      <div className={styles.legend}>
        <LegendCompact text="Succeeded | Failed" color="#26ca3b" color2="#e23b41" />
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

    //---- STEP 1: AGGREGATE BUILDS PER TIME INTERVAL ----
    const data = [];
    const granularity = this.getGranularity(props.chartResolution);
    const curr = moment(props.firstSignificantTimestamp).startOf(granularity.unit).subtract(1, props.chartResolution);
    const end = moment(props.lastSignificantTimestamp).endOf(granularity.unit).add(1, props.chartResolution);
    const next = moment(curr).add(1, props.chartResolution);
    for (let i = 0; curr.isSameOrBefore(end); curr.add(1, props.chartResolution), next.add(1, props.chartResolution)) {
      //Iterate through time buckets
      const currTimestamp = curr.toDate().getTime();
      const nextTimestamp = next.toDate().getTime();
      const obj = { date: currTimestamp, succeeded: 0, failed: 0 }; //Save date of time bucket, create object
      for (; i < props.builds.length && Date.parse(props.builds[i].createdAt) < nextTimestamp; i++) {
        //Iterate through commits that fall into this time bucket
        const buildDate = Date.parse(props.builds[i].createdAt);
        if (buildDate >= currTimestamp && buildDate < nextTimestamp) {
          obj.succeeded += props.builds[i].stats.success || 0;
          obj.failed += props.builds[i].stats.failed || -0.001; //-0.001 for stack layout to realize it belongs on the bottom
        }
      }
      data.push(obj);
    }

    //--- STEP 2: CONSTRUCT CHART DATA FROM AGGREGATED BUILDS ----
    const ciChartData = [];
    const ciScale = [0, 0];
    _.each(data, function (build) {
      ciChartData.push({ date: build.date, Succeeded: build.succeeded, Failed: build.failed > 0 ? build.failed * -1 : 0 });
      if (ciScale[1] < build.succeeded) {
        ciScale[1] = build.succeeded;
      }
      if (ciScale[0] > build.failed * -1) {
        ciScale[0] = build.failed * -1;
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
