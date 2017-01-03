'use strict';

import React from 'react';
import bulma from 'bulma';

import cx from 'classnames';

export default class Message extends React.Component {
  render() {
    return (
      <article className={cx(bulma.message, bulma[`is-${this.props.type || 'info'}`])}>
        {this.props.header &&
          <div className={bulma['message-header']}>
            {this.props.header}
          </div>
        }
        <div className={bulma['message-body']}>
          {this.props.children}
        </div>
      </article>
    );
  }
}
