'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';
import { requestCodeFileData, updateCode } from '../sagas';

const mapStateToProps = (state /*, ownProps*/) => {
  const corState = state.visualizations.codeEditor.state;

  return {
    requestCodeFileData: corState.data.isFetching,
    receiveCodeFileData: corState.data,
    receiveOverlay: corState.data.overlay,
    receiveUpdateCode: corState.data.update
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onRequestCodeFileData: () => dispatch(requestCodeFileData()),
    onUpdateCode: update => dispatch(updateCode(update))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
