'use strict';

import _ from 'lodash';
import React from 'react';
import * as d3 from "d3";

import { } from 'react'

import { generateData } from "./data-generator";

export default class Sunburst extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidUpdate() {
    if (!!this.props.fileTreeHistory && this.props.fileTreeHistory.length > 0 && !this.initialized) {
      this.initialized = true
      this.createChart();
    } else if (this.initialized) {
      this.update(this.props.fileTreeHistory[this.props.selectedCommit], this.props.selectedCommit);
    }
  }

  createChart() {
    this.settings = {};
    this.settings.radius = 400;
    this.settings.margin = 1;
    this.settings.padding = 1;
    this.settings.contributorColors = {
      1: 'red',
      2: 'green',
      3: 'blue',
      4: 'yellow',
      5: 'purple'
    }
    this.settings.contributionVisibilityDuration = 4;
    this.settings.msBetweenIterations = 500;
    this.settings.variant = 'sunburst'; // 'sunburst' | 'sunrise' | 'sundown'

    this.settings.fullAngle = this.settings.variant === 'sunburst' ? 2 * Math.PI : Math.PI;
    this.settings.width = 2 * this.settings.radius// * (variant === 'sunburst' ? 1 : 2);
    this.settings.height = 2 * this.settings.radius;

    const rotation = {
      'sunburst': 0,
      'sundown': 90,
      'sunrise': 270
    }

    this.svg = d3.select(this.chartRef)
      .attr("transform", "rotate(" + rotation[this.settings.variant] + ") ")
      .attr("viewBox", [-this.settings.margin - this.settings.radius, -this.settings.margin - this.settings.radius, this.settings.width, this.settings.height])
      .attr("width", this.settings.width)
      .attr("height", this.settings.height)
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;")

    this.settings.color = d3.scaleSequential(d3.interpolate('#bbb', '#ccc'))

    // this.props.fileTreeHistory = generateData();
    this.index = 0;

    this.update(this.props.fileTreeHistory[0], 0);
  }

  update(data, iteration) {
    const root = d3.hierarchy(data, d => getChildren(d));
    root.sum(d => Math.max(0, d.size))
    // root.sort((a, b) => d3.descending(a.value, b.value))

    d3.partition().size([this.settings.fullAngle, this.settings.radius])(root);

    root.children.forEach((child, i) => child.index = i);

    let cell = this.svg
      .selectAll("path")
      .data(root.descendants())
        
    cell = cell.enter()
      .append("path")
      .attr("class", "fileArc")
      .merge(cell)
      .transition()
      .ease(t => t)
      .duration(iteration === 0 ? 0 : this.settings.msBetweenIterations)
      .attrTween("d", arcTweenFunction(this.settings.radius, this.settings.padding))
      .attr("fill", d => this.getColor(d, iteration))
      .attr("fill-opacity", d => d.depth === 0 ? 0 : 1)
      
  }
  
  getColor(d, iteration) {
    const baseColor = this.settings.color((d.x1 + d.x0) / 2 / this.settings.fullAngle)
    if (!d.data.contributor) {
      return baseColor;
    }
    const contributorBaseColor = this.settings.contributorColors[d.data.contributor];
    return d3.interpolate(contributorBaseColor, baseColor)(Math.min(1, (iteration - d.data.changeIteration) / this.settings.contributionVisibilityDuration))
  }

  render() {
    return (
      <svg ref={svg => this.chartRef = svg}></svg>
    );
  }
}


function arcTweenFunction(radius, padding) {
  return function(d) {
    const arc = d3.arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .padAngle(d => Math.min((d.x1 - d.x0) / 2, 2 * padding / radius))
      .padRadius(radius / 2)
      .innerRadius(d => d.y0)
      .outerRadius(d => d.y1 - padding)

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
}

function getChildren(data) {
  return !data || !data.children ? undefined : Object.getOwnPropertyNames(data.children).map(prop => data.children[prop]);
}