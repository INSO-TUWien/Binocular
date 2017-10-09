'use strict';

import { connect } from 'react-redux';
import IssueImpact from './chart.js';

const mapStateToProps = state => {
  return {
    issue: state.issueImpactData.data.issue,
    filteredCommits: state.issueImpactConfig.filteredCommits,
    filteredFiles: state.issueImpactConfig.filteredFiles
  };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(IssueImpact);
