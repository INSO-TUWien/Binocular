'use-strict';
import React from 'react';
import BubbleChart, { Bubble } from '../../../components/BubbleChart';
import { MergeRequest } from '../../../types/dbTypes';
import LegendCompact from '../../../components/LegendCompact';
import _ from 'lodash';
import styles from '../styles.module.scss';
import { connect } from 'react-redux';

interface Props {
  mergeRequests: any[];
  mergeRequestLifeCycleState: any;
}

interface State {
  lifeCycleData: Bubble[];
}

class ChartComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { lifeCycleData } = this.extractLifeCycleData(props);
    this.state = {
      lifeCycleData: lifeCycleData,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { lifeCycleData } = this.extractLifeCycleData(nextProps);
    this.setState({
      lifeCycleData: lifeCycleData,
    });
  }

  render() {
    const lifeCycleChart = (
      <div className={styles.chart}>
        {this.state.lifeCycleData !== undefined && this.state.lifeCycleData.length > 0 ? (
          <BubbleChart data={this.state.lifeCycleData} paddings={{ top: 20, left: 60, bottom: 20, right: 30 }} />
        ) : (
          <div>No data during this time period!</div>
        )}
      </div>
    );

    const loadingHint = (
      <div>
        <h1>
          Loading... <i className="fas fa-spinner fa-pulse" />
        </h1>
      </div>
    );

    const legend = (
      <div>
        <LegendCompact text="Open | Closed | Merged" color="#6cc644" color2="#bd2c00" color3="#6e5494" />
      </div>
    );

    return (
      <div className={styles.chartContainer}>
        {this.state.lifeCycleData === null && loadingHint}
        {lifeCycleChart}
        {legend}
      </div>
    );
  }

  extractLifeCycleData(props) {
    if (!props.mergeRequests || props.mergeRequests.length === 0) {
      return { lifeCycleData: [] };
    }

    const mergeRequests = props.mergeRequests;
    const lifeCycleData: Bubble[] = [];

    _.each(mergeRequests, (mergeRequest: MergeRequest) => {
      const referenceDate = mergeRequest.closedAt ? Date.parse(mergeRequest.closedAt) : Date.now();
      let color: string;
      switch (mergeRequest.state) {
        case 'OPEN':
          color = '#6cc644';
          break;
        case 'CLOSED':
          color = '#bd2c00';
          break;
        case 'MERGED':
          color = '#6e5494';
          break;
        default:
          color = 'yellow';
          break;
      }

      const bubble: Bubble = {
        x: Math.round((referenceDate - Date.parse(mergeRequest.createdAt)) / this.getTimeConversionFactor(props)),
        y: 10 + Math.random(),
        size: 3,
        color: color,
      };
      lifeCycleData.push(bubble);
    });

    if (props.mergeRequestLifeCycleState.config.grouping === 'cumulative') {
      const groupedData: Bubble[] = this.getGroupedDataCumulative(lifeCycleData);
      return { lifeCycleData: groupedData };
    } else if (props.mergeRequestLifeCycleState.config.grouping === 'category') {
      const groupedData: Bubble[] = this.getGroupedDataCategory(lifeCycleData);
      return { lifeCycleData: groupedData };
    }

    return { lifeCycleData: lifeCycleData };
  }

  getGroupedDataCumulative(lifeCycleData: Bubble[]): Bubble[] {
    const groupedData = this.groupData(lifeCycleData);
    const cumulativeData: Bubble[] = [];

    for (const color in groupedData) {
      for (const x in groupedData[color]) {
        const bubble: Bubble = {
          x: parseInt(x),
          y: 10 + Math.random(),
          color: color,
          size: 10 + groupedData[color][x].length / 10,
        };

        cumulativeData.push(bubble);
      }
    }

    return cumulativeData;
  }

  getGroupedDataCategory(lifeCycleData: Bubble[]): Bubble[] {
    const groupedData = this.groupData(lifeCycleData);
    const categoryData: Bubble[] = [];

    for (const color in groupedData) {
      let size = 0;
      for (const x in groupedData[color]) {
        size += groupedData[color][x].length;
      }
      const bubble: Bubble = {
        x: 0,
        y: 0,
        size: 10 + size / 10,
        color: color,
      };

      categoryData.push(bubble);
    }

    return categoryData;
  }

  /**
   * groups the data by its color and its x-value and returns it as an object of the form
   * { 'color1': {'value1': [{...}:Bubble, ...]}, 'color2': {'value2': [{...}:Bubble, ...]}}
   * @param lifeCycleData the data to be grouped
   * @returns the grouped data as an object
   */
  groupData(lifeCycleData: Bubble[]) {
    const groupedData = {};
    lifeCycleData.forEach((item) => {
      const { x, color } = item;
      if (!groupedData[color]) {
        groupedData[color] = {};
      }

      if (!groupedData[color][x]) {
        groupedData[color][x] = [];
      }

      groupedData[color][x].push(item);
    });

    return groupedData;
  }

  /**
   * provides the conversion rate for millis according to the 'group' property of the component
   * this will always return the default value of days unless 'showMergeRequests' is set to 'cumulative'
   * @param props props of the component
   * @returns the conversion rate for millis
   */
  getTimeConversionFactor(props): number {
    const CONVERT_MILLIS_TO_HOURS = 3600000;
    const CONVERT_MILLIS_TO_DAYS = CONVERT_MILLIS_TO_HOURS * 24;
    // 365.25 => avg days in a year
    const CONVERT_MILLIS_TO_MONTHS = CONVERT_MILLIS_TO_DAYS * (365.25 / 12);
    const CONVERT_MILLIS_TO_YEARS = CONVERT_MILLIS_TO_DAYS * 365.25;

    // grouping is only available for cumulative display setting
    if (props.mergeRequestLifeCycleState.config.grouping !== 'cumulative') {
      return CONVERT_MILLIS_TO_DAYS;
    }

    switch (props.mergeRequestLifeCycleState.config.granularity) {
      case 'hour':
        return CONVERT_MILLIS_TO_HOURS;
      case 'day':
        return CONVERT_MILLIS_TO_DAYS;
      case 'month':
        return CONVERT_MILLIS_TO_MONTHS;
      case 'year':
        return CONVERT_MILLIS_TO_YEARS;
      default:
        return CONVERT_MILLIS_TO_DAYS;
    }
  }
}

const mapStateToProps = (state) => ({
  mergeRequestLifeCycleState: state.visualizations.mergeRequestLifeCycle.state,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ChartComponent);
