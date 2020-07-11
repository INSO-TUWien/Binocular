'use strict';

import _ from 'lodash';
import styles from './sidebar.css';
import PanelLink from './PanelLink.js';

import cx from 'classnames';

const Sidebar = props => {
  const links = _.map(props.visualizations, vis => {
    return <PanelLink key = {
      vis.id
    }
    visualization = {
      vis
    }
    />;
  });

  const ConfigComponent = props.visualizations[props.activeVisualization].ConfigComponent;

  return ( <nav className = {cx('panel', styles.sidebar)} >
    <p className = "panel-heading" > Visualizations </p>
      <p className = {cx("panel-tabs",styles.tabs)} > {links} </p>
      <div className = {cx('panel-block', styles.configuration)} > {props.activeVisualization in props.visualizations && <ConfigComponent/>}</div>
    </nav >
  );
};

export default Sidebar;
