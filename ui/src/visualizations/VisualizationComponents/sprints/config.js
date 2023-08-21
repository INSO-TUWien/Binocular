'use strict';

import { connect } from 'react-redux';
import { setDisplayMetric, setSelectedAuthors } from './sagas';
import styles from './styles.scss';

const mapStateToProps = (state /*, ownProps*/) => {
  const sprintsState = state.visualizations.sprints.state;

  return {};
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {};
};

const SprintsConfigComponent = (props) => {
  return <div className={styles.configContainer}></div>;
};

const DashboardConfig = connect(mapStateToProps, mapDispatchToProps)(SprintsConfigComponent);

export default DashboardConfig;
