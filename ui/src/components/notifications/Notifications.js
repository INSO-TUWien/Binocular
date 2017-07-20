'use strict';

import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import _ from 'lodash';

import Notification from './Notification.js';
import styles from './notifications.scss';

export default class Notifications extends React.Component {
  render() {
    const notifications = _.map(this.props.notifications, n => {
      return (
        <Notification type={n.type} key={n.id} onClose={() => this.props.onCloseNotification(n.id)}>
          {n.message}
        </Notification>
      );
    });

    return (
      <div className={styles.notifications}>
        <ReactCSSTransitionGroup
          transitionName={styles}
          transitionEnterTimeout={500}
          transitionLeaveTimeout={300}>
          {notifications}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}
