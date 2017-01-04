'use strict';

import React from 'react';
import _ from 'lodash';
import bulma from 'bulma';
import styles from './config-button.scss';
import Icon from '../icon';

import cx from 'classnames';

export default class ConfigButton extends React.Component {
  render() {

    return (
      <div className={cx(bulma.box, styles.configButton)}>
        <div className={cx({[styles.spinning]: this.props.spinning})}>
          <a href='#'>
            <Icon name='config' />
          </a>
        </div>
      </div>
    );
  }
}
ConfigButton.propTypes = {
  name: React.PropTypes.bool
};
