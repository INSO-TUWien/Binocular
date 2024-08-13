'use-strict';
import React from 'react';
import BubbleChart, { Bubble } from '../../../components/BubbleChart';
import { Author, Comment, MergeRequest, ReviewThread } from '../../../types/dbTypes';
import _ from 'lodash';
import styles from '../styles.module.scss';
import { connect } from 'react-redux';
import { incrementCollectionForSelectedAuthors } from '../../merge-request-ownership/chart/utils';

interface Props {
  mergeRequests: any[];
  allAuthors: any;
  selectedAuthors: any;
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
          <BubbleChart
            data={this.state.metricsData}
            paddings={{ top: 20, left: 60, bottom: 20, right: 30 }}
            showXAxis={true}
            showYAxis={false}
            useGroups={this.props.codeReviewMetricsState.config.grouping === 'file'}
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

    return (
      <div className={styles.chartContainer}>
        {this.state.metricsData === null && loadingHint}
        {metricsChart}
      </div>
    );
  }

  extractMergeRequestData(props) {
    if (!props.mergeRequests || props.mergeRequests.length === 0) {
      return { metricsData: [] };
    }

    const mergeRequests = props.mergeRequests;
    const metricsData: Bubble[] = [];
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
      this.extractUsersData(metricsData, usersData, label);
    } else if (configState.grouping === 'file') {
      this.getReviewThreadOwnershipCountByFile(mergeRequests, filesData, props);
      this.extractFilesData(metricsData, filesData);
    }
    console.log(metricsData);
    return { metricsData };
  }

  extractUsersData(metricsData: Bubble[], usersData: Map<string, [number, string]>, label: string): void {
    usersData.forEach((entry, user) => {
      const [count, color] = entry;
      const bubble: Bubble = {
        x: 0,
        y: 0,
        originalX: 0,
        originalY: 0,
        color: color,
        size: count,
        data: [
          { label: 'login', value: user },
          { label: label, value: count },
        ],
      };
      metricsData.push(bubble);
    });
  }

  extractFilesData(metricsData: Bubble[], filesData: Map<string, number>): void {
    filesData.forEach((count, file) => {
      // get group
      let identifier = '/';
      let foldername = '/';
      const paths = file.split('/');
      if (paths && paths.length > 1) {
        identifier += paths.slice(0, -1).join('/');
        foldername += paths[paths.length - 2];
      }

      const bubble: Bubble = {
        x: 0,
        y: 0,
        originalX: 0,
        originalY: 0,
        color: 'red',
        size: count,
        data: [
          { label: 'Filename', value: file },
          { label: 'Reviews', value: count },
        ],
        group: { identifier, foldername },
      };
      metricsData.push(bubble);
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
