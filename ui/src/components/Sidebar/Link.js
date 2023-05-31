'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import styles from './sidebar.scss';
import cx from 'classnames';
import returnIcon from './assets/return.svg';

export default class Link extends React.Component {
  render() {
    return (
      <a
        href="#"
        className={cx(styles.link, this.props.odd ? styles.oddLink : '')}
        key={this.props.key}
        onClick={(e) => {
          e.preventDefault();
          this.props.onClick();
        }}>
        <span style={{ display: 'inline-block' }}>{this.props.children}</span>
        {this.props.pressReturnToSelect ? (
          <span className={styles.pressReturnToSelect}>
            <img src={returnIcon} />
          </span>
        ) : (
          ''
        )}
      </a>
    );
  }
}

Link.propTypes = {
  isActive: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
};
