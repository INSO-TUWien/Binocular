'use strict';

import PropTypes from 'prop-types';
import cx from 'classnames';

import Icon from '../../icon';
import styles from './help-button.scss';

const HelpButton = props =>
  <div className={cx(styles.helpButton)}>
    <div className={cx({ [styles.spinning]: props.spinning })}>
      <a href="#" onClick={props.onClick}>
        <Icon name={props.icon} />
      </a>
    </div>
  </div>;

HelpButton.propTypes = {
  spinning: PropTypes.bool
};

export default HelpButton;
