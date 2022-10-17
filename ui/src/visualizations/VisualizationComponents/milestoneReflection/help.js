'use strict';

import cx from 'classnames';

import styles from './styles.scss';

export default () =>
  <div className={cx('box', styles.help)}>
    <h1 className="title">Hotspot Dials Help</h1>
    <p>Todo: place a question mark sign anywhere in the page which will display this page if clicked.</p>
  </div>;
