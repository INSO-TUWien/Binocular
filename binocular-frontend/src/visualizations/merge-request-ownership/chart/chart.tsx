'use-strict';
import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import BubbleChart, { Bubble } from '../../../components/BubbleChart';
import { Author, MergeRequest } from '../../../types/dbTypes';
import styles from '../styles.module.scss';

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

    categoryCount.forEach((count, assignee) => {
      const colors = ['red', 'green', 'blue', 'yellow'];
      const bubble: Bubble = {
        x: 10 + Math.random(),
        y: 10 + Math.random(),
        size: 50 + count,
        color: colors[Math.floor(Math.random() * (3 - 0 + 1) + 0)],
      };
      ownershipData.push(bubble);
    });

    return { ownershipData };
  }

  extractAssigneeCount(mergeRequests, props) {
    const assigneeCounts = new Map<string, number>();

    _.each(mergeRequests, (mergeRequest: MergeRequest) => {
      this.filterCollectionForSelectedAuthors(mergeRequest.assignee, mergeRequest.assignees, props, assigneeCounts);
    });

    return assigneeCounts;
  }

  extractReviewerCount(mergeRequests, props) {
    const reviewerCounts = new Map<string, number>();

    _.each(mergeRequests, (mergeRequest: MergeRequest) => {
      this.filterCollectionForSelectedAuthors(mergeRequest.reviewer, mergeRequest.reviewers, props, reviewerCounts);
    });

    return reviewerCounts;
  }

  filterCollectionForSelectedAuthors(field, collection, props, map) {
    if (!field || collection.length === 0) {
      return;
    }

    for (const person of collection) {
      let authorHit = false;
      for (const author of Object.keys(props.allAuthors)) {
        const authorName = author.split('<')[0].slice(0, -1);
        if (person.login === authorName) {
          if (props.selectedAuthors.filter((a: string) => a === author).length > 0) {
            authorHit = true;
            break;
          }
        }
      }

      if (!authorHit) return;
      map.set(person.login, (map.get(person.login) || 0) + 1);
    }
  }
}

const mapStateToProps = (state) => ({
  mergeRequestOwnershipState: state.visualizations.mergeRequestOwnership.state,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ChartComponent);
