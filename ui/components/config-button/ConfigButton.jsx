'use strict';

import React from 'react';
import _ from 'lodash';
import bulma from 'bulma';
import styles from './config-button.css';
import Icon from '../icon';

import cx from 'classnames';

export default class ConfigButton extends React.Component {
  render() {

    return (
      <div className={cx(bulma.box, styles.configButton)}>
        <a href='#'>
          <Icon name='config'/>
        </a>
      </div>
    );
  }
}
