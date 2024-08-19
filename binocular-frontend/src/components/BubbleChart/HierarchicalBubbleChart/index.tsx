'use-strict';

import BubbleChart from '..';
import { HierarchicalBubbleChartProps, HierarchicalBubbleChartState, HierarchicalDataPoint, HierarchicalDataPointNode } from '../types';
import * as d3 from 'd3';

export default class HierarchicalBubbleChart extends BubbleChart<HierarchicalBubbleChartProps, HierarchicalBubbleChartState> {
  constructor(props: HierarchicalBubbleChartProps | Readonly<HierarchicalBubbleChartProps>, styles: any) {
    super(props, styles);
    this.state = {
      tooltipX: 0,
      tooltipY: 0,
      tooltipVisible: false,
      tooltipData: [],
      data: props.data,
    };
  }

  componentDidUpdate(prevProps: Readonly<HierarchicalBubbleChartProps>, prevState: Readonly<HierarchicalBubbleChartState>): void {
    if (prevProps.data !== this.props.data || prevState.data !== this.props.data) {
      this.setState({
        data: this.props.data,
      });
      this.updateElement();
    }
  }

  async updateElement() {
    const { data } = this.state;
    this.visualizeData(data);
  }

  visualizeData(data: HierarchicalDataPointNode) {
    if (!data) {
      return;
    }

    const svg = d3.select(this.svgRef!);
    const { width, height } = this.getDimsAndPaddings(svg);
    svg.selectAll('*').remove();

    this.drawChart(svg, this.buildHierarchy(data, height, width));
  }

  buildHierarchy(root, height, width) {
    const hierarchy = d3.hierarchy(root).sum((d) => (d.datapoint ? d.datapoint.size : 10));

    const pack = d3.pack<HierarchicalDataPointNode>().size([width, height]).padding(20);
    const packedHierarchy = pack(hierarchy);
    return packedHierarchy.descendants();
  }

  drawChart(svg, groupedData) {
    const simulation = d3
      .forceSimulation(groupedData)
      .force('charge', d3.forceManyBody().strength(0))
      .force('x', d3.forceX())
      .force('y', d3.forceY());

    const leaf = svg
      .selectAll('g')
      .data(groupedData)
      .enter()
      .append('g')
      .attr('transform', (d: any) => `translate(${d.x + 1},${d.y + 1})`);

    const files = ['#00000', '#062F4F', '#813772', '#B82601'];

    const circle = leaf
      .append('circle')
      .attr('r', (d: any) => d.r)
      .attr('fill', (d) => (d.data.datapoint ? files[d.depth % 4] : 'white'))
      .style('stroke', (d) => (d.data.datapoint || d.data.isRoot ? 'none' : '#000'))
      .style('stroke-width', (d) => (d.data.datapoint ? 'none' : 2))
      .style('cursor', (d) => (d.data.datapoint ? 'default' : 'pointer'))
      .on('mouseover', (event, d) => {
        this.setState({
          tooltipX: event.layerX + 20,
          tooltipY: event.layerY + 20,
          tooltipVisible: true,
          tooltipData: d.data.datapoint ? d.data.datapoint.tooltipData : [{ label: 'Foldername', value: d.data.subgroupName }],
        });
      })
      .on('mousemove', (event, d) => {
        this.setState({
          tooltipX: event.layerX + 20,
          tooltipY: event.layerY + 20,
        });
      })
      .on('mouseout', () => {
        this.setState({
          tooltipData: [],
          tooltipVisible: false,
        });
      })
      .on('click', (event, d) => {
        if (d.data.datapoint) return;
        this.props.handleSubgroupClick(d);
      })
      .on('dblclick', (event, d) => {
        this.props.handleDoubleClick();
      });

    simulation.on('tick', () => {
      circle.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
    });
  }
}
