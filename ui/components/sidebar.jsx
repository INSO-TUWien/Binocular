'use strict';

import React from 'react';
import _ from 'lodash';

export default class Sidebar extends React.Component {
  render() {

    const links = _.map( this.props.visualizations, vis => {
      return (
        <a href='#'
           className={this.props.activeVisualization === vis.id ? 'is-active' : ''}
           key={vis.id}
           onClick={() => this.props.onSelectVisualization(vis.id)}>
            {vis.label}
        </a>
      );
    } );


    return (
      <nav className='panel'>
        <p className='panel-heading'>
          Visualizations
        </p>
        <p className='panel-tabs'>
          {links}
        </p>
      </nav>
    );
  }
}
