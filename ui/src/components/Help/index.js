'use strict';

import Promise from 'bluebird';
import _ from 'lodash';
import { connect } from 'react-redux';
import cx from 'classnames';

import styles from './styles.scss';

const mapStateToProps = (state /*, ownProps*/) => {
  return {
    shown: state.showHelp
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {};
};

const HelpComponent = props => {
  return (
    <div className={cx(styles.help, { [styles.shown]: props.shown })}>
      {props.children}
    </div>
  );
};

const Help = connect(mapStateToProps, mapDispatchToProps)(HelpComponent);

export default Help;
