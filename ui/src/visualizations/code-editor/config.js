'use strict';

import { connect } from 'react-redux';
import { requestCodeFileData, setSelectedBlames, updateCode, updateOverlay } from './sagas';
import CodeEditorConfigComponent from './configComponent';

const mapStateToProps = (state /*, ownProps*/) => {
  const corState = state.visualizations.codeEditor.state;

  return {
    receiveSelectedBlames: corState.config.blames,
    receiveAllFiles: corState.config.data,
    receiveCodeFileData: corState.data.data,
    receiveAllBlames: corState.data.blames
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onSetSelectedBlames: blames => dispatch(setSelectedBlames(blames)),
    requestCodeFileData: file => dispatch(requestCodeFileData(file)),
    updateOverlay: overlay => dispatch(updateOverlay(overlay)),
    updateCode: code => dispatch(updateCode(code))
  };
};

const CodeEditorConfig = connect(mapStateToProps, mapDispatchToProps)(CodeEditorConfigComponent);

export default CodeEditorConfig;
