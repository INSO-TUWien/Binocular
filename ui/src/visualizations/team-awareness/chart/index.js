'use strict';

import { connect } from 'react-redux';
import { getState } from '../util/util.js';
import Chart from './chart.js';
import { setConflictPartners } from '../sagas';

const mapStateToProps = (appState /*, chartState */) => {
  const { data, config } = getState(appState);

  console.log('chart', data);
  return {
    highlightedStakeholders: config.highlightedStakeholders,
    hasConflictBranchSelected: config.selectedConflictBranch !== 'not_set',
    selectedStakeholders: config.selectedStakeholders,
    isConflictsProcessing: data.isConflictsProcessing,
    data: {
      conflicts: data.data.conflicts,
      stakeholders: data.data.stakeholders,
      activityTimeline: data.data.activityTimeline
    }
  };
};

const mapDispatchToProps = dispatch => ({
  highlightPartners: partners => dispatch(setConflictPartners(partners))
});

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
