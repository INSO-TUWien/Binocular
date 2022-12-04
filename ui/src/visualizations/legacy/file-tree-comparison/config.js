'use strict';

import { connect } from 'react-redux';

const mapStateToProps = (state /*, ownProps*/) => {
  const fileTreeState = state.visualizations.fileTreeComparison.state.data.data;
  return {
    commits: fileTreeState.commits,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
  };
};

const ChangesConfigComponent = (props) => {
  return (
    <div>
    </div>
  );
};

const FileTreeConfig = connect(mapStateToProps, mapDispatchToProps)(ChangesConfigComponent);

export default FileTreeConfig;
