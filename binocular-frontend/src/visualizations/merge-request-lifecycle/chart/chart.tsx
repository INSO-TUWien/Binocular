'use-strict';
import React from 'react';
import { MergeRequest } from '../../../types/dbTypes';
import LegendCompact from '../../../components/LegendCompact';
import _ from 'lodash';
import styles from '../styles.module.scss';
import { connect } from 'react-redux';
import { CoordinateDataPoint } from '../../../components/BubbleChart/types';
import CoordinateBubbleChart from '../../../components/BubbleChart/CoordinateBubbleChart';

interface Props {
  mergeRequests: any[];
  mergeRequestLifeCycleState: any;
}

interface State {
  lifeCycleData: CoordinateDataPoint[];
}

class ChartComponent extends React.Component<Props, State> {
  private COLOR_MR_OPEN = '#6cc644';
  private COLOR_MR_CLOSED = '#bd2c00';
  private COLOR_MR_MERGED = '#6e5494';
  private COLOR_MR_UNDEFINED = 'yellow';

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
          <CoordinateBubbleChart
            data={this.state.lifeCycleData}
            paddings={{ top: 20, left: 60, bottom: 20, right: 30 }}
            showXAxis={true}
            showYAxis={false}
          />
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
        <LegendCompact
          text="Open | Closed | Merged"
          color={this.COLOR_MR_OPEN}
          color2={this.COLOR_MR_CLOSED}
          color3={this.COLOR_MR_MERGED}
        />
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
    const lifeCycleData: CoordinateDataPoint[] = [];

    _.each(mergeRequests, (mergeRequest: MergeRequest) => {
      const referenceDate = mergeRequest.closedAt ? Date.parse(mergeRequest.closedAt) : Date.now();
      let color: string;
      switch (mergeRequest.state) {
        case 'OPEN':
          color = this.COLOR_MR_OPEN;
          break;
        case 'CLOSED':
          color = this.COLOR_MR_CLOSED;
          break;
        case 'MERGED':
          color = this.COLOR_MR_MERGED;
          break;
        default:
          color = this.COLOR_MR_UNDEFINED;
          break;
      }
      const timespan = Math.round((referenceDate - Date.parse(mergeRequest.createdAt)) / this.getTimeConversionFactor(props));
      const y = 0 + Math.random();
      const bubble: CoordinateDataPoint = {
        x: timespan,
        y: y,
        originalX: timespan,
        originalY: y,
        size: 10,
        color: color,
        tooltipData: [
          { label: 'State', value: this.getStateForColor(color) },
          { label: 'Duration', value: timespan },
        ],
      };
      lifeCycleData.push(bubble);
    });
    if (props.mergeRequestLifeCycleState.config.grouping === 'cumulative') {
      const groupedData: CoordinateDataPoint[] = this.getGroupedDataCumulative(lifeCycleData);
      return { lifeCycleData: groupedData };
    } else if (props.mergeRequestLifeCycleState.config.grouping === 'category') {
      const groupedData: CoordinateDataPoint[] = this.getGroupedDataCategory(lifeCycleData);
      return { lifeCycleData: groupedData };
    }

    return { lifeCycleData: lifeCycleData };
  }

  getGroupedDataCumulative(lifeCycleData: CoordinateDataPoint[]): CoordinateDataPoint[] {
    const groupedData = this.groupData(lifeCycleData);
    const cumulativeData: CoordinateDataPoint[] = [];

    for (const color in groupedData) {
      for (const x in groupedData[color]) {
        const y = 0 + Math.random();
        const bubble: CoordinateDataPoint = {
          x: parseInt(x),
          y: y,
          originalX: parseInt(x),
          originalY: y,
          color: color,
          size: groupedData[color][x].length,
          tooltipData: [
            { label: 'State', value: this.getStateForColor(color) },
            { label: 'Duration', value: x + ' ' + this.props.mergeRequestLifeCycleState.config.granularity + 's' },
          ],
        };

        cumulativeData.push(bubble);
      }
    }

    return cumulativeData;
  }

  getGroupedDataCategory(lifeCycleData: CoordinateDataPoint[]): CoordinateDataPoint[] {
    const groupedData = this.groupData(lifeCycleData);
    const categoryData: CoordinateDataPoint[] = [];

    for (const color in groupedData) {
      let size = 0;
      for (const x in groupedData[color]) {
        size += groupedData[color][x].length;
      }
      const bubble: CoordinateDataPoint = {
        x: 0,
        y: 0,
        originalX: 0,
        originalY: 0,
        size: size,
        color: color,
        tooltipData: [
          { label: 'State', value: this.getStateForColor(color) },
          { label: 'Pull Requests', value: size },
        ],
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
  groupData(lifeCycleData: CoordinateDataPoint[]) {
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

  getStateForColor(color: string) {
    switch (color) {
      case this.COLOR_MR_OPEN:
        return 'OPEN';
      case this.COLOR_MR_CLOSED:
        return 'CLOSED';
      case this.COLOR_MR_MERGED:
        return 'MERGED';
      default:
        return this.COLOR_MR_UNDEFINED;
    }
  }
}

const mapStateToProps = (state) => ({
  mergeRequestLifeCycleState: state.visualizations.mergeRequestLifeCycle.state,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ChartComponent);
