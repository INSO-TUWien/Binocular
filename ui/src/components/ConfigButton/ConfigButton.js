'use strict';

import PropTypes from 'prop-types';
import cx from 'classnames';

import Icon from '../icon';
import styles from './config-button.scss';

const ConfigButton = props => (
  <div className={cx('box', styles.configButton)}>
    <div className={cx({ [styles.spinning]: props.spinning })}>
      <a href="#" onClick={props.onClick}>
        <Icon name="cog" />
      </a>
    </div>
  </div>
);

ConfigButton.propTypes = {
  spinning: PropTypes.bool
};

export default ConfigButton;
