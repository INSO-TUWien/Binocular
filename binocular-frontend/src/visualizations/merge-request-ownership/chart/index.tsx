'use-strict';

import { connect } from 'react-redux';

import Chart from './chart';

const mapStateToProps = (state) => {
  const mergeRequestOwnershipState = state.visualizations.mergeRequestOwnership.state;
  const universalSettings = state.universalSettings;
  return {
    mergeRequests: mergeRequestOwnershipState.data.data.mergeRequests,
    selectedAuthors: universalSettings.selectedAuthorsGlobal,
    allAuthors: universalSettings.allAuthors,
    firstSignificantTimestamp: mergeRequestOwnershipState.data.data.firstSignificantTimestamp,
    lastSignificantTimestamp: mergeRequestOwnershipState.data.data.lastSignificantTimestamp,
  };
};

const mapDispatchToProps = () => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
