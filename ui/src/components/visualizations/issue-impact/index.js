'use strict';

import { connect } from 'react-redux';
import IssueImpact from './chart.js';

const mapStateToProps = state => {
  console.log('mapping state to props:', state.issueImpactData.data.issue);
  return {
    issue: state.issueImpactData.data.issue
  };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(IssueImpact);
