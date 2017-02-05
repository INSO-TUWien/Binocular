'use strict';

import React from 'react';
import cx from 'classnames';
import * as d3 from 'd3';

import Axis from './Axis.jsx';

export default class CodeOwnershipRiver extends React.Component {

  constructor() {
    super();
    
    console.log( 'd3:', d3 );
    this.histogram = d3.histogram();
  }

  componentWillReceiveProps( props ) {
    this.updateD3( props );
  }

  updateD3( props ) {
  }

  render() {

    const commits = _.map( this.props.commits.data, function( c ) {
      return c.Files.length;
    } );

    let translate = `translate(0, -50)`;

    console.log( commits );
    const bars = this.histogram( commits );

    return (
      <svg>
        <g transform={translate}> 
          {bars.map(d => this.makeBar(d))}
        </g>
      </svg>
    );
  }

  makeBar( d ) {
    console.log( 'makeBar called with', d );
  }
}
