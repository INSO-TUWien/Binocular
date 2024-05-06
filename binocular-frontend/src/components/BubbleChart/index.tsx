'use strict';

import React from 'react';
import * as d3 from 'd3';

interface Props {
  data: Bubble[];
  height: number;
  width: number;
}

interface State {
  data: any;
  height: number;
  width: number;
}

export interface Bubble {
  x: number;
  y: number;
  size: number;
  color: string;
}

export default class BubbleChart extends React.Component<Props, State> {
  private svgRef: React.RefObject<SVGSVGElement>;

  constructor(props: Props | Readonly<Props>, styles: any) {
    super(props);

    this.state = {
      data: props.data,
      height: props.height,
      width: props.width,
    };

    this.svgRef = React.createRef();
  }

  drawChart() {
    const { data, width, height } = this.props;
    const svg = d3.select(this.svgRef.current);

    const xScale = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d.x)!, d3.max(data, (d) => d.x)!])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d.y)!, d3.max(data, (d) => d.y)!])
      .range([0, height]);

    const radiusScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.size)!])
      .range([2, 20]);

    svg
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.x))
      .attr('cy', (d) => yScale(d.y))
      .attr('r', (d) => radiusScale(d.size))
      .attr('fill', (d) => d.color);
  }

  render() {
    return (
      <div>
        <svg ref={this.svgRef} width={this.props.width} height={this.props.height} />
      </div>
    );
  }
}
