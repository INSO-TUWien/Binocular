'use strict';

import React from 'react';
import _ from 'lodash';
import Icon from '../icon';

import styles from './config-button.scss';
import cx from 'classnames';

export default class ConfigButton extends React.Component {
  render() {

    return (
      <div className={cx('box', styles.configButton)}>
        <div className={cx({[styles.spinning]: this.props.spinning})}>
          <a href='#'>
            <Icon name='cog' />
          </a>
        </div>
      </div>
    );
  }
}
ConfigButton.propTypes = {
  spinning: React.PropTypes.bool
};
