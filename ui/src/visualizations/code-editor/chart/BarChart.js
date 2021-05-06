import React from 'react';
import * as d3 from 'd3';

export default class BarChart extends React.Component {
  componentDidMount() {
    this.drawChart();
    // this.drawRectangle();
  }

  drawChart() {
    const data = this.props.data;
    const svg = d3
      .select('#' + this.props.id)
      .append('svg')
      .attr('width', this.props.width)
      .attr('height', this.props.height);

    svg
      .selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d, i) => i * 70)
      .attr('y', (d, i) => 0)
      .attr('width', 65)
      .attr('height', (d, i) => this.props.height)
      .attr('fill', 'green');
  }

  render() {
    return null;
  }
}
