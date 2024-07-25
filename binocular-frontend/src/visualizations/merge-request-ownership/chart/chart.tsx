'use-strict';
import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import BubbleChart, { Bubble } from '../../../components/BubbleChart';
import { Author, MergeRequest } from '../../../types/dbTypes';
import styles from '../styles.module.scss';
import { incrementCollectionForSelectedAuthors } from './utils';

interface Props {
  mergeRequestOwnershipState: any;
}

interface State {
  ownershipData: Bubble[];
}

class ChartComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { ownershipData } = this.extractOwnershipData(props);
    this.state = {
      ownershipData: ownershipData,
    };
  }

  componentWillReceiveProps(nextProps: Readonly<Props>): void {
    const { ownershipData } = this.extractOwnershipData(nextProps);
    this.setState({
      ownershipData: ownershipData,
    });
  }

  render() {
    const ownershipChart = (
      <div className={styles.chart}>
        {this.state.ownershipData !== undefined && this.state.ownershipData.length > 0 ? (
          <BubbleChart data={this.state.ownershipData} paddings={{ top: 20, left: 60, bottom: 20, right: 30 }} />
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
        {this.state.ownershipData === null && loadingHint}
        {ownershipChart}
      </div>
    );
  }

  extractOwnershipData(props) {
    if (!props.mergeRequests || props.mergeRequests.length === 0) {
      return { ownershipData: [] };
    }

    const mergeRequests = props.mergeRequests;
    const ownershipData: Bubble[] = [];
    const categoryCount =
      props.mergeRequestOwnershipState.config.category === 'assignees'
        ? this.extractAssigneeCount(mergeRequests, props)
        : this.extractReviewerCount(mergeRequests, props);

    categoryCount.forEach((value, author) => {
      const [count, color] = value;
      const bubble: Bubble = {
        x: 10,
        y: 10,
        size: 50 + count,
        color: color,
      };
      ownershipData.push(bubble);
    });

    return { ownershipData };
  }

  extractAssigneeCount(mergeRequests, props) {
    const assigneeCounts = new Map<string, [number, string]>();

    _.each(mergeRequests, (mergeRequest: MergeRequest) => {
      incrementCollectionForSelectedAuthors(
        mergeRequest.assignees,
        props.allAuthors,
        props.selectedAuthors,
        assigneeCounts,
        props.mergeRequestOwnershipState.config.onlyShowAuthors,
      );
    });

    return assigneeCounts;
  }

  extractReviewerCount(mergeRequests, props) {
    const reviewerCounts = new Map<string, [count: number, color: string]>();

    _.each(mergeRequests, (mergeRequest: MergeRequest) => {
      incrementCollectionForSelectedAuthors(
        mergeRequest.reviewers,
        props.allAuthors,
        props.selectedAuthors,
        reviewerCounts,
        props.mergeRequestOwnershipState.config.onlyShowAuthors,
      );
    });

    return reviewerCounts;
  }
}

const mapStateToProps = (state) => ({
  mergeRequestOwnershipState: state.visualizations.mergeRequestOwnership.state,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ChartComponent);
