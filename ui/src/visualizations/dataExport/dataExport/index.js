'use strict';

import { connect } from 'react-redux';

import DataExport from './dataExport';

const mapStateToProps = (state /*, ownProps*/) => {
  const exportState = state.visualizations.export.state;
  return {};
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(DataExport);
