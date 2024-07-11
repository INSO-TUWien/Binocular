'use strict';

import React from 'react';
import * as d3 from 'd3';
import * as baseStyles from './bubbleChart.module.scss';

interface Props {
  data: Bubble[];
  paddings: { top: number; left: number; bottom: number; right: number };
}

interface State {
  data: Bubble[];
}

export interface Bubble {
  x: number;
  y: number;
  size: number;
  color: string;
}

// TODO: refactor to remove duplicate code from ScalableBaseChart
export default class BubbleChart extends React.Component<Props, State> {
  private styles: any;
  private svgRef: SVGSVGElement | null | undefined;

  constructor(props: Props | Readonly<Props>, styles: any) {
    super(props);
    this.styles = Object.freeze(Object.assign({}, baseStyles, styles));
    this.state = {
      data: props.data,
    };

    window.addEventListener('resize', () => this.updateElement());
  }

  componentDidMount() {
    this.updateElement();
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>) {
    if (prevProps.data !== this.props.data || prevState.data !== this.state.data) {
      this.setState({
        data: this.props.data,
      });
      this.updateElement();
    }
  }

  async updateElement() {
    this.visualizeData();
  }

  getXDims() {
    const extent = d3.extent(this.state.data, (d) => d.x);
    const padding = (extent[1]! - extent[0]!) * 0.1;
    return [extent[0]! - padding, extent[1]! + padding];
  }

  getYDims() {
    const extent = d3.extent(this.state.data, (d) => d.y);
    const padding = (extent[1]! - extent[0]!) * 0.1;
    return [extent[0]! - padding, extent[1]! + padding];
  }

  getRadiusDims() {
    return [0, d3.max(this.state.data, (d: any) => d.size)];
  }

  createScales(xDims, xRange, yDims, yRange, radiusDims, radiusRange) {
    const x = d3.scaleLinear().domain(xDims).range(xRange);
    const y = d3.scaleLinear().domain(yDims).range(yRange);
    const radius = d3.scaleSqrt().domain(radiusDims).range(radiusRange);

    return { x, y, radius };
  }

  getDimsAndPaddings(svg: any) {
    const paddings = this.props.paddings || { left: 0, right: 0, top: 0, bottom: 0 };
    const node = !svg || typeof svg.node !== 'function' ? { getBoundingClientRec: () => ({}) } : svg.node();
    const clientRect = node ? node.getBoundingClientRect() : {};
    const width = clientRect.width || 0;
    const height = clientRect.height || 0;

    return { width, height, paddings };
  }

  setBrushBubble(brushBubble: any, brush: any, scales) {
    brushBubble.append('g').attr('class', 'brush').call(brush);

    const bubbleStreams = brushBubble
      .append('g')
      .selectAll('circle')
      .data(this.state.data)
      .enter()
      .append('circle')
      .attr('cx', (d) => scales.x(d.x))
      .attr('cy', (d) => scales.y(d.y))
      .attr('r', (d) => scales.radius(d.size))
      .attr('fill', (d) => d.color)
      .classed('bubble', true);

    return bubbleStreams;
  }

  drawChart(svg, brush, scales, height, width, paddings) {
    const brushBubble = svg.append('g');
    const bubble = this.setBrushBubble(brushBubble.append('g'), brush, scales);

    const axes = Object.assign({
      x: this.createXAxis(brushBubble, scales, height, paddings),
      y: this.createYAxis(brushBubble, scales, height, paddings),
    });

    return { brushBubble, axes, bubble };
  }

  createXAxis(brushBubble, scales, height, paddings) {
    return brushBubble
      .append('g')
      .attr('class', this.styles.axis)
      .attr('transform', `translate(0,${height - paddings.bottom})`)
      .call(d3.axisBottom(scales.x));
  }

  createYAxis(brushBubble, scales, height, paddings) {
    return brushBubble
      .append('g')
      .attr('class', this.styles.axis)
      .attr('transform', 'translate(' + paddings.left + ',0)')
      .call(d3.axisLeft(scales.y));
  }

  visualizeData() {
    const { data } = this.state;
    if (!data) {
      return;
    }

    const svg = d3.select(this.svgRef!);
    const { width, height, paddings } = this.getDimsAndPaddings(svg);

    const scales = this.createScales(
      this.getXDims(),
      [paddings.left, width - paddings.right],
      this.getYDims(),
      [height - paddings.bottom, paddings.top],
      this.getRadiusDims(),
      [d3.min(data, (d: any) => d.size), d3.max(data, (d: any) => d.size)],
    );

    svg.selectAll('*').remove();

    const brush = d3.brushX().extent([
      [paddings.left, 0],
      [width - paddings.right, height],
    ]);

    const { bubble } = this.drawChart(svg, brush, scales, height, width, paddings);

    d3.forceSimulation(data)
      .force(
        'x',
        d3.forceX((d: any) => scales.x(d.x)),
      )
      .force(
        'y',
        d3.forceY((d: any) => scales.y(d.y)),
      )
      .force(
        'collision',
        d3.forceCollide((d) => scales.radius(d.size) + 1),
      )
      .on('tick', () => bubble.attr('cx', (d) => d.x).attr('cy', (d) => d.y));
  }

  render() {
    return (
      <div className={this.styles.chartDiv}>
        <svg className={this.styles.chartSvg} ref={(svg) => (this.svgRef = svg)} />
      </div>
    );
  }
}
