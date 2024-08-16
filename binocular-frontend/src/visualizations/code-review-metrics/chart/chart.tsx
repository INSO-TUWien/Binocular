'use-strict';
import React from 'react';
import * as d3 from 'd3';
import { Author, Comment, MergeRequest, ReviewThread } from '../../../types/dbTypes';
import _ from 'lodash';
import styles from '../styles.module.scss';
import { connect } from 'react-redux';
import { incrementCollectionForSelectedAuthors } from '../../merge-request-ownership/chart/utils';
import { CoordinateDataPoint, HierarchicalDataPoint, HierarchicalDataPointNode } from '../../../components/BubbleChart/types';
import CoordinateBubbleChart from '../../../components/BubbleChart/CoordinateBubbleChart';
import HierarchicalBubbleChart from '../../../components/BubbleChart/HierarchicalBubbleChart';

interface Props {
  mergeRequests: any[];
  allAuthors: any;
  selectedAuthors: any;
  codeReviewMetricsState: any;
}

interface State {
  hierarchicalMetricsData: HierarchicalDataPoint[];
  coordinateMetricsData: CoordinateDataPoint[];
}

class ChartComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { hierarchicalMetricsData, coordinateMetricsData } = this.extractMergeRequestData(props);
    this.state = {
      hierarchicalMetricsData,
      coordinateMetricsData,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { hierarchicalMetricsData, coordinateMetricsData } = this.extractMergeRequestData(nextProps);
    this.setState({
      hierarchicalMetricsData,
      coordinateMetricsData,
    });
  }

  render() {
    const noData = <div>No data during this time period!</div>;
    const renderFile = this.props.codeReviewMetricsState.config.grouping === 'file';

    const hiearchicalChart = (
      <div className={styles.chart}>
        {this.state.hierarchicalMetricsData !== undefined && this.state.hierarchicalMetricsData.length > 0 ? (
          <HierarchicalBubbleChart data={this.state.hierarchicalMetricsData} paddings={{ top: 20, left: 60, bottom: 20, right: 30 }} />
        ) : (
          noData
        )}
      </div>
    );

    const coordinateChart = (
      <div className={styles.chart}>
        {this.state.coordinateMetricsData !== undefined && this.state.coordinateMetricsData.length > 0 ? (
          <CoordinateBubbleChart
            data={this.state.coordinateMetricsData}
            paddings={{ top: 20, left: 60, bottom: 20, right: 30 }}
            showXAxis={true}
            showYAxis={false}
          />
        ) : (
          noData
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

    return (
      <div className={styles.chartContainer}>
        {(this.state.hierarchicalMetricsData === null || this.state.coordinateMetricsData === null) && loadingHint}
        {renderFile ? hiearchicalChart : coordinateChart}
      </div>
    );
  }

  extractMergeRequestData(props) {
    if (!props.mergeRequests || props.mergeRequests.length === 0) {
      return { hierarchicalMetricsData: [], coordinateMetricsData: [] };
    }

    const mergeRequests = props.mergeRequests;
    const coordinateMetricsData: CoordinateDataPoint[] = [];
    const hierarchicalMetricsData: HierarchicalDataPoint[] = [];
    const usersData = new Map<string, [number, string]>();
    const filesData = new Map<string, number>();

    const configState = props.codeReviewMetricsState.config;
    if (configState.grouping === 'user') {
      let label = '';
      switch (configState.category) {
        case 'comment':
          label = 'Comments posted';
          this.getCommentOwnershipCountByUser(mergeRequests, usersData, props);
          break;
        case 'review':
          label = 'Reviews done';
          this.getReviewOwnershipCountByUser(mergeRequests, usersData, props);
          break;
        default:
          break;
      }
      this.extractUsersData(coordinateMetricsData, usersData, label);
    } else if (configState.grouping === 'file') {
      this.getReviewThreadOwnershipCountByFile(mergeRequests, filesData, props);
      this.extractFilesData(hierarchicalMetricsData, filesData);
    }

    return { hierarchicalMetricsData, coordinateMetricsData };
  }

  extractUsersData(data: CoordinateDataPoint[], usersData: Map<string, [number, string]>, label: string): void {
    usersData.forEach((entry, user) => {
      const [count, color] = entry;
      const datapoint: CoordinateDataPoint = {
        x: 0,
        y: 0,
        originalX: 0,
        originalY: 0,
        color: color,
        size: count,
        tooltipData: [
          { label: 'login', value: user },
          { label: label, value: count },
        ],
      };
      data.push(datapoint);
    });
  }

  extractFilesData(data: HierarchicalDataPoint[], filesData: Map<string, number>): void {
    filesData.forEach((count, file) => {
      // get group
      let identifier = '/';
      let foldername = '/';
      const paths = file.split('/');
      if (paths && paths.length > 1) {
        identifier += paths.slice(0, -1).join('/');
        foldername += paths[paths.length - 2];
      }

      const bubble: HierarchicalDataPoint = {
        size: count,
        tooltipData: [
          { label: 'Filename', value: file },
          { label: 'Reviews', value: count },
        ],
        identifier,
        subgroupPath: foldername,
      };
      data.push(bubble);
    });
  }

  /**
   * returns the amount of review threads owned per user
   * @param mergeRequests all mergerequests in the project
   * @param authorMap map that stores the results (key: user login, value: count)
   */
  getReviewOwnershipCountByUser(mergeRequests: MergeRequest[], authorMap: Map<string, [number, string]>, props): void {
    const authors: Author[] = [];
    _.each(mergeRequests, (mergeRequest: MergeRequest) => {
      mergeRequest.reviewThreads.forEach((reviewThread: ReviewThread) => {
        const ownership = reviewThread.comments[0];
        if (!ownership || !ownership.author) return;
        authors.push(ownership.author);
      });
    });
    incrementCollectionForSelectedAuthors(authors, props.allAuthors, props.selectedAuthors, authorMap);
  }

  /**
   * returns the amount of comments owned per user
   * @param mergeRequests all mergerequests in the project
   * @param authorMap map that stores the results (key: user login, value: count)
   */
  getCommentOwnershipCountByUser(mergeRequests: MergeRequest[], authorMap: Map<string, [number, string]>, props): void {
    const authors: Author[] = [];
    _.each(mergeRequests, (mergeRequest: MergeRequest) => {
      // process comments directly inside the merge request
      mergeRequest.comments.forEach((comment: Comment) => {
        if (!comment.author) return;
        authors.push(comment.author);
      });
      // process comments of a review thread inside the merge request
      mergeRequest.reviewThreads.forEach((reviewThread: ReviewThread) => {
        reviewThread.comments.forEach((comment: Comment) => {
          if (!comment.author) return;
          authors.push(comment.author);
        });
      });
    });
    incrementCollectionForSelectedAuthors(authors, props.allAuthors, props.selectedAuthors, authorMap);
  }

  /**
   * returns the amount of review threads for any file
   * @param mergeRequests all mergerequests in the project
   * @param fileMap map that stores the results (key: path, value: count)
   */
  getReviewThreadOwnershipCountByFile(mergeRequests: MergeRequest[], fileMap: Map<string, number>, props) {
    _.each(mergeRequests, (mergeRequest: MergeRequest) => {
      mergeRequest.reviewThreads.forEach((reviewThread: ReviewThread) => {
        if (props.codeReviewMetricsState.config.globalActiveFiles.find((file) => file === reviewThread.path)) {
          this.handleMapIncrementation(reviewThread.path, fileMap);
        }
      });
    });
  }

  /**
   * increments the  count  on a map
   * @param key key of the element to be incremented
   * @param map the map to be incremented on
   */
  handleMapIncrementation(key: string, map: Map<string, number>): void {
    const count = map.get(key) || 0;
    map.set(key, count + 1);
  }
}

const mapStateToProps = (state) => ({
  codeReviewMetricsState: state.visualizations.codeReviewMetrics.state,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ChartComponent);
