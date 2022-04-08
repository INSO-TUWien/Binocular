'use strict';

import _ from 'lodash';
import React from 'react';
import * as d3 from "d3";
import { generateData } from "./data-generator";

export default class Sunburst extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.createChart();
  }

  componentDidUpdate() {
    this.createChart();
  }

  createChart() {
    let radius = 400;
    const margin = 1;
    const padding = 1;
    const contributorColors = {
      1: 'red',
      2: 'green',
      3: 'blue',
      4: 'yellow',
      5: 'purple'
    }
    const contributionVisibilityDuration = 4;
    const msBetweenIterations = 500;
    const variant = 'sunburst'; // 'sunburst' | 'sunrise' | 'sundown'

    const fullAngle = variant === 'sunburst' ? 2 * Math.PI : Math.PI;
    const width = 2 * radius// * (variant === 'sunburst' ? 1 : 2);
    const height = 2 * radius;

    const rotation = {
      'sunburst': 0,
      'sundown': 90,
      'sunrise': 270
    }

    const arc = d3.arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .padAngle(d => Math.min((d.x1 - d.x0) / 2, 2 * padding / radius))
      .padRadius(radius / 2)
      .innerRadius(d => d.y0)
      .outerRadius(d => d.y1 - padding);

    const svg = d3.select(this.chartRef)
      .attr("transform", "rotate(" + rotation[variant] + ") ")
      .attr("viewBox", [-margin - radius, -margin - radius, width, height])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;")

    const color = d3.scaleSequential(d3.interpolate('#bbb', '#ccc'))

    function getColor(d, iteration) {
      const baseColor = color((d.x1 + d.x0) / 2 / fullAngle)
      if (!d.data.contributor) {
        return baseColor;
      }
      const contributorBaseColor = contributorColors[d.data.contributor];
      return d3.interpolate(contributorBaseColor, baseColor)(Math.min(1, (iteration - d.data.changeIteration) / contributionVisibilityDuration))
    }

    function arcTween(d) {
      if (!this._current) {
        this._current = d;
      }

      var interpolateStartAngle = d3.interpolate(this._current.x0, d.x0);
      var interpolateEndAngle = d3.interpolate(this._current.x1, d.x1);
      
      this._current = d;

      return function(t) {
        d.x0 = interpolateStartAngle(t);
        d.x1 = interpolateEndAngle(t);
        return arc(d);
      };
    };

    function update(data, iteration) {
      const root = d3.hierarchy(data, d => !!d ? d.children : undefined);
      root.sum(d => Math.max(0, d.size))
      // root.sort((a, b) => d3.descending(a.value, b.value))

      d3.partition().size([fullAngle, radius])(root);

      root.children.forEach((child, i) => child.index = i);

      let cell = svg
        .selectAll("path")
        .data(root.descendants())
          
      cell = cell.enter()
        .append("path")
        .merge(cell)
        .transition()
        .ease(t => t)
        .duration(iteration === 0 ? 0 : msBetweenIterations)
        .attrTween("d", arcTween)
        .attr("fill", d => getColor(d, iteration))
        .attr("fill-opacity", d => d.depth === 0 ? 0 : 1);
    }

    const data = generateData();

    let index = 0;

    update(data[0], 0);
    setInterval(() => !!data[++index] ? update(data[index], index) : undefined, msBetweenIterations);
  }

  render() {
    return (
      <svg ref={svg => this.chartRef = svg}></svg>
    );
  }
}
