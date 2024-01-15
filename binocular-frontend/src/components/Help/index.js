'use strict';

import { connect } from 'react-redux';
import cx from 'classnames';
import Measure from 'react-measure';

import { callSafe } from '../../utils';

import styles from './styles.module.scss';

const mapStateToProps = (state /*, ownProps*/) => {
  return {
    shown: state.showHelp,
  };
};

const mapDispatchToProps = (/*dispatch, ownProps*/) => {
  return {};
};

const HelpComponent = (props) => {
  return (
    <Measure bounds onResize={callSafe(props.onResize)}>
      {({ measureRef }) => (
        <div className={cx(styles.help, { [styles.shown]: props.shown })} ref={measureRef}>
          {props.children}
        </div>
      )}
    </Measure>
  );
};

const Help = connect(mapStateToProps, mapDispatchToProps)(HelpComponent);

export default Help;
