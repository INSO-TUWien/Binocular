'use strict';

import React from 'react';
import styles from '../styles.scss';
import data from './data';
import * as d3 from 'd3';

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    data.fetchData().then();
    this.state = {
      commitData: [],
      colorPalette: [],
      id: props.id,
    };
    data.fetchData().then((resp) => {
      this.setState({ commitData: resp.commitData, colorPalette: resp.palette });
    });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.generateChart();
  }

  render() {
    return (
      <div id={'chartContainer' + this.state.id} className={styles.chartContainer}>
        <svg id={'chart' + this.state.id} className="chart" />
      </div>
    );
  }

  generateChart() {
    d3.select('#chart' + this.state.id + '>*').remove();
    const margin = { top: 10, right: 10, bottom: 10, left: 60 },
      width = document.getElementById('chartContainer' + this.state.id).clientWidth - margin.left - margin.right,
      height = document.getElementById('chartContainer' + this.state.id).clientHeight - margin.top - margin.bottom;

    const chart = d3
      .select('#chart' + this.state.id)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    const x = d3
      .scaleTime()
      .domain(
        d3.extent(this.state.commitData, function (d) {
          return Date.parse(d.date);
        })
      )
      .range([0, width]);
    chart
      .append('g')
      .attr('transform', 'translate(0,' + height / 2 + ')')
      .call(d3.axisBottom(x));

    // Add Y axis
    const y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(this.state.commitData, function (d) {
          return Math.max(d.stats.deletions, d.stats.additions);
        }),
      ])
      .range([height / 2, 0]);
    chart.append('g').call(d3.axisLeft(y));

    // Add the line
    chart
      .append('path')
      .datum(this.state.commitData)
      .attr('fill', '#BFFFBF')
      .attr('stroke', 'green')
      .attr('stroke-width', 1.5)
      .attr(
        'd',
        d3
          .line()
          .x(function (d) {
            return x(Date.parse(d.date));
          })
          .y(function (d) {
            return y(d.stats.additions);
          })
          .curve(d3.curveBasis)
      );

    const y2 = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(this.state.commitData, function (d) {
          return Math.max(d.stats.deletions, d.stats.additions);
        }),
      ])
      .range([height / 2, height]);
    chart.append('g').call(d3.axisLeft(y2));

    // Add the line
    chart
      .append('path')
      .datum(this.state.commitData)
      .attr('fill', '#FFBDBD')
      .attr('stroke', 'red')
      .attr('stroke-width', 1.5)
      .attr(
        'd',
        d3
          .line()
          .x(function (d) {
            return x(Date.parse(d.date));
          })
          .y(function (d) {
            return y2(d.stats.deletions);
          })
          .curve(d3.curveBasis)
      );
  }
}
