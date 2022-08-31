/* eslint-disable max-len */
import React from 'react';
import _ from 'lodash';
import * as style from './ConflictOverview.scss';
import ConflictOverviewItem from './ConflictOverviewItem';

export default class ConflictOverview extends React.Component {
  constructor(props) {
    super(props);
    this.styles = _.assign({}, style);

    this.state = {
      showContent: false,
      contentCloseTimeout: -1
    };
  }

  calculateConflictAmount() {
    let amount = 0;
    this.props.conflicts.forEach(c => (amount += c.data.length));
    return amount;
  }

  reduceConflictsToStakeholders() {
    const conflictedFiles = this.props.conflicts ? this.props.conflicts : [];
    const conflicts = new Map();

    for (const conflictedFile of conflictedFiles) {
      for (const branch of conflictedFile.data) {
        for (const conflict of branch.conflicts) {
          const participants = `${conflict.conflictStakeholder.id}${conflict.otherStakeholder.id}`;
          if (!conflicts.has(participants) && conflict.conflictStakeholder.id !== conflict.otherStakeholder.id) {
            conflicts.set(participants, { conflictStakeholder: conflict.conflictStakeholder, otherStakeholder: conflict.otherStakeholder });
          }
        }
      }
    }
    return Array.from(conflicts.values());
  }

  render() {
    const conflicts = this.reduceConflictsToStakeholders();
    const participantsTag = conflicts.length > 1 ? 'participants' : 'participant';

    const handleContentMouseOver = () => {
      clearTimeout(this.state.contentCloseTimeout);
      this.setState({ showContent: true });
    };

    const handleContentClose = () => {
      this.setState({ contentCloseTimeout: setTimeout(() => this.setState({ showContent: false }), 250) });
    };

    if (!this.props.branchSelected) {
      return <div className={this.styles.conflictOverviewNoSelection}>No conflict branch selected</div>;
    }

    if (this.props.loading) {
      return (
        <div className={[this.styles.conflictOverview, this.styles.conflictOverviewHeader].join(' ')}>
          <svg
            className={this.styles.conflictOverviewIcon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Processing conflicts...</span>
        </div>
      );
    }

    if (conflicts.length === 0) {
      return (
        <div className={[this.styles.conflictOverview, this.styles.conflictOverviewHeader].join(' ')}>
          <svg
            className={this.styles.conflictOverviewIcon}
            fill="none"
            stroke="#27ae60"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
          <span>Could not detect any possible conflicts with selected branches</span>
        </div>
      );
    }

    return (
      <div className={this.styles.conflictOverview}>
        <div
          className={this.styles.conflictOverviewHeader}
          onMouseOver={() => this.setState({ showContent: true })}
          onMouseOut={handleContentClose}>
          <svg className={this.styles.conflictOverviewIcon} fill="#E67E22" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            Detected conflicts with {conflicts.length} {participantsTag}
          </span>
        </div>
        {this.state.showContent &&
          <div className={this.styles.conflictOverviewContent} onMouseOver={handleContentMouseOver} onMouseOut={handleContentClose}>
            {conflicts.map((conflict, i) =>
              <ConflictOverviewItem
                highlightPartners={this.props.highlightPartners}
                colors={this.props.colors}
                conflict={conflict}
                key={i}
              />
            )}
          </div>}
      </div>
    );
  }
}
