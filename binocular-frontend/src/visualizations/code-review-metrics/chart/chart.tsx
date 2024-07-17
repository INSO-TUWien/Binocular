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
  codeReviewMetricsState: any;
}

interface State {
  metricsData: Bubble[];
}

class ChartComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { metricsData } = this.extractMergeRequestData(props);
    this.state = {
      metricsData,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { metricsData } = this.extractMergeRequestData(nextProps);
    this.setState({
      metricsData,
    });
  }

  render() {
    const metricsChart = (
      <div className={styles.chart}>
        {this.state.metricsData !== undefined && this.state.metricsData.length > 0 ? (
          <BubbleChart data={this.state.metricsData} paddings={{ top: 20, left: 60, bottom: 20, right: 30 }} />
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
        {this.state.metricsData === null && loadingHint}
        {metricsChart}
        {legend}
      </div>
    );
  }

  extractMergeRequestData(props) {
    if (!props.mergeRequests || props.mergeRequests.length === 0) {
      return { metricsData: [] };
    }

    const mergeRequests = props.mergeRequests;
    const metricsData: Bubble[] = [];

    console.log(props.codeReviewMetricsState);

    _.each(mergeRequests, (mergeRequest: MergeRequest) => {});

    return { metricsData };
  }
}

const mapStateToProps = (state) => ({
  codeReviewMetricsState: state.visualizations.codeReviewMetrics.state,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ChartComponent);
