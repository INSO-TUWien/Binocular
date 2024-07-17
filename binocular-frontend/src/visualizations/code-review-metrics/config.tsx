'use-strict';

import React from 'react';
import TabCombo from '../../components/TabCombo';
import * as styles from './styles.module.scss';
import { connect } from 'react-redux';
import { setGroup, setMergeRequests } from './sagas';

interface Props {
  codeReviewMetricsState: any;
}

class ConfigComponent extends React.Component<Props> {
  render() {
    return <div className={styles.configContainer}>Config</div>;
  }
}

const mapStateToProps = (state) => ({
  codeReviewMetricsState: state.visualizations.codeReviewMetrics.state,
});

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ConfigComponent);
