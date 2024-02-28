'use strict';

import { connect } from 'react-redux';

import styles from './styles.module.scss';

const mapStateToProps = (state /*, ownProps*/) => {
  return {};
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {};
};

const IssueBreakdownConfigComponent = (props) => {
  return <div className={styles.configContainer}></div>;
};

const IssueBreakdownConfig = connect(mapStateToProps, mapDispatchToProps)(IssueBreakdownConfigComponent);

export default IssueBreakdownConfig;
