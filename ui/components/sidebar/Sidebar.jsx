'use strict';

import React from 'react';
import _ from 'lodash';

import styles from './sidebar.css';
import PanelLink from './PanelLink.jsx';
import CodeOwnershipRiverConfig from '../visualizations/code-ownership-river/config.jsx';

import cx from 'classnames';

export default class Sidebar extends React.Component {

  render() {

    const links = _.map( this.props.visualizations, vis => {
      return (
        <PanelLink key={vis.id} visualization={vis}></PanelLink>
      );
    } );

    return (
      <nav className={cx('panel', styles.sidebar)}>
        <p className='panel-heading'>
          Visualizations
        </p>
        <p className='panel-tabs'>
          {links}
        </p>
        <div className='panel-block'>
          <CodeOwnershipRiverConfig />
        </div>
      </nav>
    );
  }
}
