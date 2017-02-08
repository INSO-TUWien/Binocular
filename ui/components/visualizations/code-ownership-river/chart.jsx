'use strict';

import React from 'react';
import Measure from 'react-measure';
import cx from 'classnames';
import * as d3 from 'd3';
import styles from './styles.scss';

import Axis from './Axis.jsx';

const parseTime = d3.timeParse( '%Y-%m-%dT%H:%M:%S.000Z' );

export default class CodeOwnershipRiver extends React.Component {


  constructor() {
    super();

    this.state = {
      dimensions: {
        width: 0,
        height: 0
      }
    };
  }

  componentWillReceiveProps( props ) {
    this.updateD3( props );
  }

  updateD3( props ) {
  }

  render() {

    const commits = _.map( this.props.commits.data, function( c, i ) {
      return _.merge( {}, c, { date: parseTime(c.date), commitCount: i + 1 } );
    } );

    const fullWidth = this.state.dimensions.width;
    const fullHeight = this.state.dimensions.height;
    const wPct = 0.8;
    const hPct = 0.6;

    const width = fullWidth * wPct;
    const height = fullHeight * hPct;
    const wMargin = (fullWidth - width)/2;
    const hMargin = (fullHeight - height)/2;

    const translate = `translate(${wMargin}, ${hMargin})`;
    
    const x = d3.scaleTime()
          .rangeRound( [0, width] )
          .domain( d3.extent(commits, c => c.date) );

    const y = d3.scaleLinear()
          .rangeRound( [height, 0] )
          .domain( d3.extent(commits, c => c.commitCount) );

    const line = d3.line()
          .x( c => x(c.date) )
          .y( c => y(c.commitCount) );


    const yAxis = d3.axisLeft( y );
    const xAxis = d3.axisBottom( x );

    
    return (
      <Measure onMeasure={dimensions => this.setState({dimensions})}>
        <div>
          <svg className={styles.chart}>
            <g transform={translate}>
              <path d={line(commits)} stroke='black' strokeWidth='1' fill='none' />
              <Axis orient='left' ticks='10' scale={y} />
              <Axis orient='bottom' scale={x} y={height} />
            </g>
          </svg>
        </div>
      </Measure>
    );
  }

  makeBar( d ) {
    console.log( 'makeBar called with', d );
  }
}
