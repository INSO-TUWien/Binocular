'use-strict';

import * as d3 from 'd3';
import BubbleChart from '..';
import {
  BubbleChartPadding,
  CoordinateBubbleChartProps,
  CoordinateBubbleChartScales,
  CoordinateBubbleChartState,
  CoordinateDataPoint,
} from '../types';

export default class CoordinateBubbleChart extends BubbleChart<CoordinateBubbleChartProps, CoordinateBubbleChartState> {
  constructor(props: CoordinateBubbleChartProps | Readonly<CoordinateBubbleChartProps>, styles: any) {
    super(props, styles);
    this.state = {
      tooltipX: 0,
      tooltipY: 0,
      tooltipVisible: false,
      tooltipData: [],
      data: props.data,
    };
  }

  handleResize = () => {
    this.reassignOriginalDataPointValues();
    super.handleResize();
  };

  async updateElement() {
    const { data } = this.state;
    this.visualizeData(data);
  }

  componentDidUpdate(prevProps: Readonly<CoordinateBubbleChartProps>, prevState: Readonly<CoordinateBubbleChartState>) {
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
  createScales(xDims, xRange, yDims, yRange, radiusDims, radiusRange): CoordinateBubbleChartScales {
    const x = d3.scaleLinear().domain(xDims).range(xRange);
    const y = d3.scaleLinear().domain(yDims).range(yRange);
    const radius = d3.scaleSqrt().domain(radiusDims).range(radiusRange);

    return { x, y, radius };
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
      .on('mouseover', (event, d: CoordinateDataPoint) => {
        this.setState({
          tooltipX: event.layerX + 20,
          tooltipY: event.layerY + 20,
          tooltipVisible: true,
          tooltipData: d.tooltipData,
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
  createXAxis(chartGroup, scales, height: number, paddings: BubbleChartPadding) {
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
  createYAxis(chartGroup, scales, paddings: BubbleChartPadding) {
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
  visualizeData(data: CoordinateDataPoint[]): void {
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

    svg.selectAll('*').remove();

    const scales = this.createScales(
      this.getXDims(),
      [paddings.left, width - paddings.right],
      this.getYDims(),
      [height - paddings.bottom, paddings.top],
      this.getRadiusDims(),
      [d3.min(data, (d: any) => d.size), d3.max(data, (d: any) => d.size)],
    );

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
  simulateData(data: CoordinateDataPoint[], scales, bubbleChart) {
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
        d3.forceCollide((d: CoordinateDataPoint) => scales.radius(d.size) + 1),
      )
      .on('tick', () => {
        bubbleChart.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
      });
  }
}
