'use strict';

import React from 'react';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';
import _ from 'lodash';

import Notification from './Notification.js';
import styles from './notifications.scss';

export default class Notifications extends React.Component {
  render() {
    const notifications = _.map(this.props.notifications, (n) => {
      return (
        <CSSTransition classNames={styles} timeout={500} key={n.id}>
          <Notification type={n.type} onClose={() => this.props.onCloseNotification(n.id)}>
            {n.message}
          </Notification>
        </CSSTransition>
      );
    });

    return (
      <div className={styles.notifications}>
        <TransitionGroup>{notifications}</TransitionGroup>
      </div>
    );
  }
}
