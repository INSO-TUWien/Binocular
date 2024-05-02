'use-strict';
import React from 'react';
import BubbleChart, { Bubble } from '../../../components/BubbleChart';
import { MergeRequest } from '../../../types/dbTypes';
import LegendCompact from '../../../components/LegendCompact';

interface Props {
  mergeRequests: any[];
}

interface State {
  metricsData: Bubble[];
}

export default class ChartComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { metricsData } = this.extractMergeRequestData(props);
    this.state = {
      metricsData,
    };
  }

  componentDidUpdate(nextProps) {
    const { metricsData } = this.extractMergeRequestData(nextProps);
    this.state = {
      metricsData,
    };
  }

  render() {
    const metricsChart = (
      <div>
        {this.state.metricsData !== undefined && this.state.metricsData.length > 0 ? (
          <BubbleChart data={this.state.metricsData} height={400} width={400} />
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
        <LegendCompact text="Opened | Closed | Merged" color="#6cc644" color2="#bd2c00" color3="#6e5494" />
      </div>
    );

    return (
      <div>
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

    mergeRequests.foreach((mergeRequest: MergeRequest) => {
      const referenceDate = mergeRequest.closedAt ? Date.parse(mergeRequest.closedAt) : Date.now();
      let color: string;
      switch (mergeRequest.state) {
        case 'OPEN':
          color = 'green';
          break;
        case 'CLOSED':
          color = 'red';
          break;
        case 'MERGED':
          color = 'purple';
          break;
        default:
          color = 'yellow';
          break;
      }

      const bubble: Bubble = {
        x: referenceDate - Date.parse(mergeRequest.createdAt),
        y: 10,
        size: 10,
        color: color,
      };
      metricsData.push(bubble);
    });

    return { metricsData };
  }
}
