import React from 'react';
import * as d3 from 'd3';

export default class PieChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      svg: undefined
    };
  }

  drawChart() {
    // set the dimensions and margins of the graph
    const margin = { top: 30, right: 30, bottom: 20, left: 30 },
      width = 500 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

    const data = [];
    const colors = [];
    this.props.data.stats.forEach(stat => {
      data.push({ label: stat.percent + '%', value: stat.count });
      colors.push(
        d3.hsl(
          stat.hslColor.hue,
          stat.hslColor.saturation,
          stat.hslColor.lightness,
          stat.hslColor.opacity
        )
      );
    });

    const svg = d3
        .select('#' + this.props.data.id)
        .append('svg')
        .attr('viewBox', [
          0,
          0,
          width + margin.left + margin.right,
          height + margin.top + margin.bottom
        ]),
      radius = Math.min(width, height) / 2,
      g = svg.append('g').attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
    this.setState({
      svg
    });
    const color = d3.scaleOrdinal(colors);

    // Generate the pie
    const pie = d3
      .pie() //this will create arc data for us given a list of values
      .value(function(d) {
        return d.value;
      }); //we must tell it out to access the value of each element

    // Generate the arcs
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    //Generate groups
    const arcs = g.selectAll('arc').data(pie(data)).enter().append('g').attr('class', 'arc');

    //Draw arc paths
    arcs
      .append('path')
      .attr('fill', function(d, i) {
        return color(i);
      })
      .attr('d', arc);
    // Add one dot in the legend for each name.
    svg
      .selectAll('mydots')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', 10)
      .attr('cy', function(d, i) {
        return 10 + i * 25;
      }) // 100 is where the first dot appears. 25 is the distance between dots
      .attr('r', 7)
      .style('fill', function(d, i) {
        return color(i);
      });

    // Add one dot in the legend for each name.
    svg
      .selectAll('mylabels')
      .data(data)
      .enter()
      .append('text')
      .attr('x', 30)
      .attr('y', function(d, i) {
        return 10 + i * 25;
      }) // 100 is where the first dot appears. 25 is the distance between dots
      .style('fill', function(d, i) {
        return color(i);
      })
      .text(function(d) {
        return d.label;
      })
      .attr('text-anchor', 'left')
      .style('alignment-baseline', 'middle');
  }

  componentDidMount() {
    this.drawChart();
  }

  componentWillUnmount() {
    if (this.state.svg) {
      this.state.svg.remove();
    }
  }

  render() {
    return null;
  }
}
