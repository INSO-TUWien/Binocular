'use strict';

import _ from 'lodash';
import React from 'react';
import * as d3 from "d3";

import { } from 'react'

export default class Sunburst extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidUpdate() {
    if (!this.performingInternalChange) {
      if (!!this.props.fileTreeHistory && this.props.fileTreeHistory.length > 0 && !this.initialized) {
        this.initialized = true
        this.createChart();
      } else if (this.initialized) {
        this.update(this.props.fileTreeHistory[this.props.selectedCommit], Number.parseInt(this.props.selectedCommit));
      }
    }
    this.performingInternalChange = false;
  }

  createChart() {
    this.prevAngleMap = new Map();
    this.settings = {};
    this.settings.radius = 400;
    this.settings.margin = 1;
    this.settings.padding = 1;

    this.settings.contributorColors = {};
    if (!!this.props.contributors) {
      const contributorCount = this.props.contributors.size;
      for (let i = 0; i < contributorCount; i++) {
        this.settings.contributorColors[i] = `hsl(${i*360/contributorCount},100%,50%)`;
      }
    }
    this.settings.contributionVisibilityDuration = 10;
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

    this.index = 0;

    this.update(this.props.fileTreeHistory[0], 0);
  }

  update(data, iteration) {
    const root = d3.hierarchy(data, d => getChildren(d));
    root.sum(d => Math.max(0, d.size))

    d3.partition().size([this.settings.fullAngle, this.settings.radius])(root);

    root.children.forEach((child, i) => child.index = i);

    if (this.prevIteration == null || iteration !== this.prevIteration + 1) {
      this.svg.selectAll(".fileArc").remove();
    }
    this.prevIteration = iteration;

    let cell = this.svg
      .selectAll(".fileArc")
      .data(root.descendants())
    
    cell = cell.enter()
      .append("path")
      .attr("class", "fileArc")
      .merge(cell)
      .on("mouseover", (e, d) => {
        this.performingInternalChange = true;
        this.setState({
          selectedFile: d.data?.fullPath
        });
      })
      .transition()
      .ease(t => t)
      .duration(iteration === 0 ? 0 : this.settings.msBetweenIterations)
      .attrTween("d", arcTweenFunction(this.settings.radius, this.settings.padding, this.prevAngleMap))
      .attr("id", (d, i) => "fileArc_" + i)
      .attr("fill", d => this.getColor(d, iteration))
      .attr("fill-opacity", d => d.depth === 0 ? 0 : 1)

    // this.svg.selectAll(".fileText").remove();

    // let text = this.svg
    //   .selectAll(".fileText")
    //   .data(root.descendants())
    
    // text = text.enter()
    //   .append("text")
    //   .attr("class", "fileText")
    //   .merge(text)
    //   .attr("x", 5)   //Move the text from the start angle of the arc
    //   .attr("dy", 18) //Move the text down
    //   .append("textPath")
    //   .attr("xlink:href", function(d, i) { return "#fileArc_" + i; })
    //   .text(d => d.x1 - d.x0 > 0.5 ? d.data.name : '')
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
      <div>
        <svg ref={svg => this.chartRef = svg}></svg>
        <div className="fileName">{this.state.selectedFile}</div>
      </div>
    );
  }
}


function arcTweenFunction(radius, padding, prevAngleMap) {
  return function(d) {
    const arc = d3.arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .padAngle(d => Math.min((d.x1 - d.x0) / 2, 2 * padding / radius))
      .padRadius(radius / 2)
      .innerRadius(d => d.y0)
      .outerRadius(d => d.y1 - padding)

    let prev = prevAngleMap.get(d.data.fullPath);
    // If this file/folder has no previous angles, it's newly added to the chart.
    // In this case we need to use its parent's end angle as both start and end angle.
    // By doing so we let the new slice appear from the "end" of its parent. 
    if (!prev && !!d.data.parentPaths) {
      for (const parentPath of d.data.parentPaths) {
        const parentAngles = prevAngleMap.get(parentPath);
        if (!!parentAngles) {
          prev = { x0: parentAngles.x1, x1: parentAngles.x1 };
          break;
        }
      }
    }
    // If it has no parents with existing angles, we let it appear from the "end" of the circle.
    if (!prev) {
      prev = { x0: 2 * Math.PI, x1: 2 * Math.PI };
    }

    var interpolateStartAngle = d3.interpolate(prev.x0, d.x0);
    var interpolateEndAngle = d3.interpolate(prev.x1, d.x1);
    
    prevAngleMap.set(d.data.fullPath, { x0: d.x0, x1: d.x1 });

    return function(t) {
      d.x0 = interpolateStartAngle(t);
      d.x1 = interpolateEndAngle(t);
      return arc(d);
    };
  };
}

function getChildren(data) {
  return data?.children ?? [];
}