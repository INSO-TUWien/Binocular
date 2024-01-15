'use strict';

import React from 'react';

import cx from 'classnames';

export default class Message extends React.Component {
  render() {
    const hasClass = !!this.props.style;

    return (
      <article className={cx('message', { [`is-${this.props.style}`]: hasClass })}>
        {this.props.header && <div className="message-header">{this.props.header}</div>}
        <div className="message-body">{this.props.children}</div>
      </article>
    );
  }
}
