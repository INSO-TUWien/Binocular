'use strict';

import cx from 'classnames';

import styles from './styles.scss';
import React from 'react';

export default () => (
  <div className={cx('box', styles.help)}>
    <h1 className="title">Symbol Lifespan Help</h1>
    <p>
      The Symbol Lifespan visualization allows you to search your source code repository for code
      symbols and see when and how they changed.
    </p>
    <h2>Searching for Symbols</h2>
    <p>To search for a symbol, enter a search term in the search bar on the top left.</p>
    <p>You can use the "Sort" button to choose a criteria by which to order the search results.</p>
    <p>You can use the "Filter" button to limit the search results.</p>
    <h2>Using the Symbol History</h2>
    <p></p>
  </div>
);
