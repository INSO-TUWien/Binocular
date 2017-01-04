'use strict';

import React from 'react';
import bulma from 'bulma';

import cx from 'classnames';

export default class Message extends React.Component {
  render() {
    const hasClass = !!this.props.style;
    const styleClass = bulma[`is-${this.props.style}`];
    
    return (
      <article className={cx(bulma.message, { [styleClass]: hasClass })}>
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
