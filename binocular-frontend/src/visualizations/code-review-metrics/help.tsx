'use-strict';

import cx from 'classnames';
import styles from '../../styles/styles.module.scss';
import React from 'react';

export default class HelpComponent extends React.Component {
  render() {
    return (
      <div className={cx('box', styles.help)}>
        <h1 className="title">Dashboard Help</h1>
        <p>Some helpful text.</p>
      </div>
    );
  }
}
