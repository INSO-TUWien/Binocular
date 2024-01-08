'use strict';

import _ from 'lodash';
import styles from './sidebar.module.scss';
import PanelLink from './PanelLink';
import menu from './assets/menu.svg';
import close from './assets/close.svg';

import cx from 'classnames';
import React from 'react';

export default class LinkList extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { visualizations, activeVisualization, search, selectedViz, visualizationSelectorActive } = this.props;

    return (
      <div>
        {_.map(
          _.filter(
            _.filter(visualizations, (vis) => visualizationSelectorActive || vis.id !== activeVisualization),
            (vis) =>
              search === '' ||
              vis.id.toLowerCase().includes(search.toLowerCase()) ||
              vis.label.toLowerCase().includes(search.toLowerCase()),
          ),
          (vis, i) => (
            <PanelLink
              key={vis.id}
              visualization={vis}
              odd={i % 2 === 0}
              pressReturnToSelect={visualizationSelectorActive && i === selectedViz}
            />
          ),
        )}
      </div>
    );
  }
}
