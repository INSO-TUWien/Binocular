'use strict';

import Promise from 'bluebird';
import { connect } from 'react-redux';
import { setOverlay, setHighlightedIssue, setCommitAttribute } from './sagas';
import SearchBox from '../../components/SearchBox';
import TabCombo from '../../components/TabCombo.js';
import styles from './styles.scss';

import { graphQl } from '../../utils';

const mapStateToProps = (state /*, ownProps*/) => {
  const corState = state.visualizations.dependencyGraph.state;

  return {
    issues: corState.data.issues,
    overlay: corState.config.overlay,
    highlightedIssue: corState.config.highlightedIssue,
    commitAttribute: corState.config.commitAttribute
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onSetOverlay: overlay => dispatch(setOverlay(overlay)),
    onSetHighlightedIssue: issue => dispatch(setHighlightedIssue(issue)),
    onChangeCommitAttribute: attr => dispatch(setCommitAttribute(attr))
  };
};

const DependencyGraphConfigComponent = props => {
  return (
    <div className={styles.configContainer}>
      
    </div>
  );
};

const DependencyGraphConfig = connect(mapStateToProps, mapDispatchToProps)(
  DependencyGraphConfigComponent
);

export default DependencyGraphConfig;
