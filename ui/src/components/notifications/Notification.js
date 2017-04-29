'use strict';

import React from 'react';
import cx from 'classnames';

import styles from './notification.scss';

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
