'use strict';

import { connect } from 'react-redux';
import { getState } from '../util/util.js';
import Chart from './chart.js';
import { showConflictDetails, setConflictPartners, hideConflictDetails, startTeamAwarenessFileConflictDetailsProcessing } from '../sagas';

const mapStateToProps = (appState /*, chartState */) => {
  const { data, config } = getState(appState);
  return {
    highlightedStakeholders: config.highlightedStakeholders,
    hasConflictBranchSelected: config.selectedConflictBranch !== 'not_set',
    selectedStakeholders: config.selectedStakeholders,
    isConflictsProcessing: data.isConflictsProcessing,
    isFileDetailsProcessing: data.isFileDetailsProcessing,

    showConflictDetails: config.showConflictDetails,
    selectedConflict: config.selectedConflict,
    data: {
      conflicts: data.data.conflicts,
      stakeholders: data.data.stakeholders,
      activityTimeline: data.data.activityTimeline,
      fileDetails: data.data.fileDetails
    }
  };
};

const mapDispatchToProps = dispatch => ({
  highlightPartners: partners => dispatch(setConflictPartners(partners)),
  startFileConflictDetails: conflict => dispatch(startTeamAwarenessFileConflictDetailsProcessing(conflict)),
  displayConflictDetails: conflict => dispatch(showConflictDetails(Object.assign({ overviewType: 'files' }, conflict))),
  hideConflictDetails: () => dispatch(hideConflictDetails())
});

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
