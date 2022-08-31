import React from 'react';
import _ from 'lodash';
import * as style from './ConflictOverview.scss';

export default class ConflictOverviewItem extends React.Component {
  constructor(props) {
    super(props);
    this.styles = _.assign({}, style);
  }

  render() {
    const { conflict: { conflictStakeholder, otherStakeholder }, colors, highlightPartners } = this.props;

    const participantA = conflictStakeholder.gitSignature.substring(0, conflictStakeholder.gitSignature.indexOf('<') - 1);
    const participantB = otherStakeholder.gitSignature.substring(0, otherStakeholder.gitSignature.indexOf('<') - 1);
    const ids = [conflictStakeholder.id, otherStakeholder.id];

    return (
      <div className={this.styles.conflictOverviewItem}>
        <svg className={this.styles.conflictOverviewItemColors}>
          <rect width={7.5} height={15} fill={colors.get(conflictStakeholder.id)} />
          <rect x={7.5} width={7.5} height={15} fill={colors.get(otherStakeholder.id)} />
        </svg>
        <span
          onMouseEnter={() => highlightPartners(ids)}
          onMouseLeave={() => highlightPartners([])}
          className={this.styles.conflictOverviewItemText}>
          Conflict between {participantA.trim()} and {participantB.trim()}
        </span>
      </div>
    );
  }
}
