'use strict';

import React, { PropTypes } from 'react';
import _ from 'lodash';
import styles from './sidebar.css';

import classnames from 'classnames';

export default class Link extends React.Component {
  render() {

    return (
      <a href='#'
         className={classnames({'is-active': this.props.isActive})}
         key={this.props.key}
         onClick={e => {
          e.preventDefault();
          this.props.onClick();
        }}>
        {this.props.children}
      </a>
    );
  }
};

Link.propTypes = {
  isActive: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired
};
