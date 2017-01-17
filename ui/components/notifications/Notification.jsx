'use strict';

import React from 'react';
import _ from 'lodash';

import styles from './notification.scss';

import cx from 'classnames';

export default class Notification extends React.Component {

  render() {

    return (
      <div className={cx( 'notification', `is-${this.props.type}`, styles.notification )}>
        <button className='delete' onClick={this.props.onClose} />
        {this.props.children}
      </div>
    );
  }
}
