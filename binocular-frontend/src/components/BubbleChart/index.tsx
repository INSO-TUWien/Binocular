'use strict';

import React from 'react';
import * as d3 from 'd3';
import * as baseStyles from './bubbleChart.module.scss';
import _ from 'lodash';
import BubbleToolTip, { ToolTipData } from './tooltip';

interface Props {
  data: Bubble[];
  paddings: Padding;
  showXAxis: boolean;
  showYAxis: boolean;
}

interface Padding {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

interface State {
  data: Bubble[];
  tooltipX: number;
  tooltipY: number;
  tooltipVisible: boolean;
  tooltipData: ToolTipData[];
}

export interface Bubble {
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  size: number;
  color: string;
  xLabel?: string;
  yLabel?: string;
  data: ToolTipData[];
}

interface Scales {
  x: any;
  y: any;
  radius: any;
}

interface WindowSpecs {
  height: number;
  width: number;
  paddings: Padding;
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
      tooltipX: 0,
      tooltipY: 0,
      tooltipVisible: false,
      tooltipData: [],
    };
    window.addEventListener('resize', this.handleResize);
  }

  handleResize = () => {
    this.reassignOriginalDataPointValues();
    this.updateElement();
  };

  componentWillUnmount() {
    window.removeEventListener('resize', () => this.updateElement());
  }

  componentDidMount() {
    this.updateElement();
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>) {
    if (prevProps.data !== this.props.data) {
      this.setState({
        data: this.props.data,
      });
      this.updateElement();
    }

    if (prevState.data !== this.state.data) {
      this.reassignOriginalDataPointValues();
      this.updateElement();
    }
  }

  async updateElement() {
    const { data } = this.state;
    this.visualizeData(data);
  }

  reassignOriginalDataPointValues() {
    this.state.data.forEach((d) => {
      d.x = d.originalX;
      d.y = d.originalY;
    });
  }

  /**
   * calculates x dims based on paddings and min/max values
   * @returns the x dims for the chart
   */
  getXDims(): [number, number] {
    const extent = d3.extent(this.state.data, (d) => d.x);
    const padding = (extent[1]! - extent[0]!) * 0.1;
    return [extent[0]! - padding, extent[1]! + padding];
  }

  /**
   * calculates y dims based on paddings and min/max values
   * @returns the y dims for the chart
   */
  getYDims(): [number, number] {
    const extent = d3.extent(this.state.data, (d) => d.y);
    const padding = (extent[1]! - extent[0]!) * 0.1;
    return [extent[0]! - padding, extent[1]! + padding];
  }

  /**
   * calculates radius dims
   * @returns the radius dims for the chart
   */
  getRadiusDims(): [number, number] {
    return [0, d3.max(this.state.data, (d: any) => d.size)];
  }

  /**
   * return the scales for the chart
   * @param xDims domain of x values
   * @param xRange range of x values
   * @param yDims domain of y values
   * @param yRange rango of y values
   * @param radiusDims domain of the radius of the bubble
   * @param radiusRange range of the radius of the bubble
   * @returns d3 scales for x y and radius
   */
  createScales(xDims, xRange, yDims, yRange, radiusDims, radiusRange): Scales {
    const x = d3.scaleLinear().domain(xDims).range(xRange);
    const y = d3.scaleLinear().domain(yDims).range(yRange);
    const radius = d3.scaleSqrt().domain(radiusDims).range(radiusRange);

    return { x, y, radius };
  }

  getDimsAndPaddings(svg: any): WindowSpecs {
    const paddings = this.props.paddings || { left: 0, right: 0, top: 0, bottom: 0 };
    const node = !svg || typeof svg.node !== 'function' ? { getBoundingClientRec: () => ({}) } : svg.node();
    const clientRect = node ? node.getBoundingClientRect() : {};
    const width = clientRect.width || 0;
    const height = clientRect.height || 0;

    return { width, height, paddings };
  }

  /**
   * fills the bubble chart group in the svg with the bubbles
   * @param chartGroup the group where the chart is placed
   * @param scales the scales for the chart
   * @returns the group of the bubble chart
   */
  createBubbleChart(chartGroup: any, scales) {
    const bubbleChart = chartGroup
      .append('g')
      .selectAll('circle')
      .data(this.state.data)
      .enter()
      .append('circle')
      .attr('cx', (d) => scales.x(d.x))
      .attr('cy', (d) => scales.y(d.y))
      .attr('r', (d) => scales.radius(d.size))
      .attr('fill', (d) => d.color)
      .classed('bubble', true)
      .on('mouseover', (event, d: Bubble) => {
        this.setState({
          tooltipX: event.layerX,
          tooltipY: event.layerY,
          tooltipVisible: true,
          tooltipData: d.data,
        });
      })
      .on('mouseout', () => {
        this.setState({
          tooltipData: [],
          tooltipVisible: false,
        });
      });

    return bubbleChart;
  }

  /**
   * @param svg the svg for the chart
   * @param scales the scales of the chart
   * @param height the height of the window
   * @param paddings the paddings of the chart
   */
  getChart(svg, scales, height, paddings) {
    const chartGroup = svg.append('g');
    const bubbleChart = this.createBubbleChart(chartGroup.append('g'), scales);

    const axes = Object.assign({
      x: this.createXAxis(chartGroup, scales, height, paddings),
      y: this.createYAxis(chartGroup, scales, paddings),
    });

    return { chartGroup, axes, bubbleChart };
  }

  /**
   * creates the x axis for the chart
   * @param chartGroup the group of the d3 element where the chart is
   * @param scales the scales for the chart
   * @param height the height of the window
   * @param paddings the paddings for the chart
   * @returns the x axis for the chart
   */
  createXAxis(chartGroup, scales, height: number, paddings: Padding) {
    if (!this.props.showXAxis) return;

    return chartGroup
      .append('g')
      .attr('class', this.styles.axis)
      .attr('transform', `translate(0,${height - paddings.bottom})`)
      .call(d3.axisBottom(scales.x));
  }

  /**
   * creates the x axis for the chart
   * @param chartGroup the group of the d3 element where the chart is
   * @param scales the scales for the chart
   * @param paddings the paddings for the chart
   * @returns the y axis for the chart
   */
  createYAxis(chartGroup, scales, paddings: Padding) {
    if (!this.props.showYAxis) return;

    return chartGroup
      .append('g')
      .attr('class', this.styles.axis)
      .attr('transform', `translate(${paddings.left},0)`)
      .call(d3.axisLeft(scales.y));
  }

  createBrush(svg, data, width, heigth) {
    const component = this;
    const brush = d3
      .brushX()
      .extent([
        [0, 0],
        [width, heigth],
      ])
      .on('end', selectionEnd);

    function selectionEnd(event) {
      const selection = event.selection;
      if (!selection) return;
      const [min, max] = selection;

      const selectedData = data.filter((d) => d.x >= min && d.x <= max);
      component.setState({
        data: selectedData,
      });
    }

    svg.append('g').attr('class', 'brush').call(brush);
  }

  /**
   * visualizes the bubbles array via a bubble chart
   */
  visualizeData(data): void {
    if (!data) {
      return;
    }

    const svg = d3.select(this.svgRef!);
    svg.on('dblclick', () => {
      this.setState({
        data: this.props.data,
      });
    });

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

    this.createBrush(svg, data, width, height);

    const { bubbleChart } = this.getChart(svg, scales, height, paddings);

    this.simulateData(data, scales, bubbleChart);
  }

  /**
   * transforms the data using d3 simulation to avoid collision and allign toward its supposed coordinates
   * @param data array that contains the bubbles to be drawn
   * @param scales scales of the chart
   * @param bubbleChart group containing the bubble chart
   */
  simulateData(data: Bubble[], scales, bubbleChart) {
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
        d3.forceCollide((d: Bubble) => scales.radius(d.size) + 1),
      )
      .on('tick', () => bubbleChart.attr('cx', (d) => d.x).attr('cy', (d) => d.y));
  }

  render() {
    return (
      <div className={this.styles.chartDiv}>
        <svg className={this.styles.chartSvg} ref={(svg) => (this.svgRef = svg)} />
        <BubbleToolTip data={this.state.tooltipData} x={this.state.tooltipX} y={this.state.tooltipY} visible={this.state.tooltipVisible} />
      </div>
    );
  }
}
