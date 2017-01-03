'use strict';

import React from 'react';
import _ from 'lodash';
import styles from './sidebar.css';
import bulma from 'bulma';
import PanelLink from './PanelLink.jsx';

import cx from 'classnames';

export default class SidebarPanel extends React.Component {
  render() {

    const links = _.map( this.props.visualizations, vis => {
      return (
        <PanelLink key={vis.id} visualization={vis}></PanelLink>
      );
    } );

    return (
      <nav className={cx(bulma['panel'], styles.sidebar)}>
        <p className={bulma['panel-heading']}>
          Visualizations
        </p>
        <p className={bulma['panel-tabs']}>
          {links}
        </p>
        <p className={bulma['panel-block']} />
      </nav>
    );
  }
}
