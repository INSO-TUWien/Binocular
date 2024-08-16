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

  async updateElement() {
    const { data } = this.state;
    this.visualizeData(data);
  }

  visualizeData(data: HierarchicalDataPoint[]) {
    if (!data) {
      return;
    }

    const svg = d3.select(this.svgRef!);
    const { width, height } = this.getDimsAndPaddings(svg);
    svg.selectAll('*').remove();

    this.drawChart(svg, this.buildHierarchy(data, height, width));
  }

  buildHierarchy(data: HierarchicalDataPoint[], heigth: number, width: number) {
    const root: HierarchicalDataPointNode = { subgroupName: 'root', children: [], isRoot: true, subgroupPath: '' };

    data.forEach((dp) => {
      let path = '';
      const folderStructure = dp.identifier.split('/');
      let currentLevel = root.children;

      folderStructure.slice(1).forEach((folder, index) => {
        let existingFolder = currentLevel.find((d) => d.subgroupName === folder);

        // in root directory
        if (folder === '') {
          root.children.push({ subgroupName: dp.tooltipData[0].value.toString(), children: [], datapoint: dp, subgroupPath: path });
          return;
        }

        path += folder;

        if (!existingFolder) {
          existingFolder = { subgroupName: folder, children: [], subgroupPath: path };
          currentLevel.push(existingFolder);
        }

        if (index === folderStructure.length - 2) {
          existingFolder.children.push({
            subgroupName: dp.tooltipData[0].value.toString(),
            children: [],
            datapoint: dp,
            subgroupPath: path,
          });
        }

        currentLevel = existingFolder.children;
        path += '/';
      });
    });

    const hierarchy = d3.hierarchy(root).sum((d) => (d.datapoint ? d.datapoint.size : 10));

    const pack = d3.pack<HierarchicalDataPointNode>().size([width, heigth]).padding(20);
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
        console.log(event);
        console.log(d);
      });

    simulation.on('tick', () => {
      circle.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
    });
  }
}
