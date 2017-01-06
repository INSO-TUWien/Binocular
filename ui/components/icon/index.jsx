import React from 'react';

import styles from './icon.css';
import cx from 'classnames';

class Icon extends React.Component {

  render() {
    let icon = `fa-${this.props.name}`;

    return (
      <span className='icon'>
        <i className={cx('fa', icon)} />
      </span>
    );
  }
};

Icon.propTypes = {
  name: React.PropTypes.string.isRequired
};

export default Icon;
