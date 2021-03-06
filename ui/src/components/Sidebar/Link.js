'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import cx from 'classnames';

export default class Link extends React.Component {
  render() {
    return (
      <a
        href="#"
        className={cx({ 'is-active': this.props.isActive })}
        key={this.props.key}
        onClick={e => {
          e.preventDefault();
          this.props.onClick();
        }}>
        {this.props.children}
      </a>
    );
  }
}

Link.propTypes = {
  isActive: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired
};
