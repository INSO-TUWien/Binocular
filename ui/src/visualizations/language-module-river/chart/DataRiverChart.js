'use strict';

import React from 'react';
import * as d3 from 'd3';
import { sankey as d3Sankey, sankeyCenter, sankeyLinkHorizontal } from 'd3-sankey';
import chroma from 'chroma-js';
import { RiverData } from './RiverData';

export class DataRiverChart extends React.Component {
  constructor(props) {
    super(props);
    this.dataset = props.dataset;
    this.colorPalette = props.colorPalette;
  }

  componentDidMount() {
    var margin = { top: 1, right: 1, bottom: 6, left: 1 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    const sankeyChart = d3Sankey()
      .nodeId(d => `${d.sha}-${d.attribute}`)
      .nodeAlign((node, n) => {
        return node.index; //sankeyCenter(node, n);
      })
      .nodeWidth(5)
      .nodePadding(0)
      .extent([[1, 5], [width - 1, height - 5]]);

    const sankey = ({ nodes, links }) =>
      sankeyChart({
        nodes: nodes.map(d => new RiverData(d)),
        links: links.map(d => Object.assign({}, d))
      });

    const svg = d3.select(this.ref).append('svg').attr('viewBox', [0, 0, width, height]);

    const data = this.dataset.reduce(
      (set, item, index) => {
        /*set.nodes.forEach(node =>
          set.links.push({
            source: `${node.sha}-${node.attribute}`,
            target: `${item.sha}-${item.attribute}`,
            value: item.additions + item.deletions
          })
        );*/

        item.value = item.additions + item.deletions;

        if (index > 0) {
          const node = set.nodes[index - 1];
          set.links.push({
            source: `${node.sha}-${node.attribute}`,
            target: `${item.sha}-${item.attribute}`,
            value: item.value
          });
        }

        set.nodes.push(item);
        return set;
      },
      { nodes: [], links: [] }
    );

    const { nodes, links } = sankey(data);

    svg
      .append('g')
      .attr('stroke', '#000')
      .selectAll('rect')
      .data(nodes)
      .join('rect')
      .attr('x', d => {
        return d.x0;
      })
      .attr('y', d => {
        return d.y0;
      })
      .attr('height', d => {
        return d.y1 - d.y0;
      })
      .attr('width', d => {
        return d.x1 - d.x0;
      })
      .attr('fill', this.color.bind(this))
      .append('title')
      .text(d => {
        return `${d.name}\n value: ${d.value}`;
      });

    const link = svg
      .append('g')
      .attr('fill', 'none')
      .attr('stroke-opacity', 0.5)
      .selectAll('g')
      .data(links)
      .join('g')
      .style('mix-blend-mode', 'multiply');

    const gradient = link
      .append('linearGradient')
      .attr('id', d => (d.uid = `link-${d.index}`))
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', d => {
        return d.source.x1;
      })
      .attr('x2', d => {
        return d.target.x0;
      });

    gradient.append('stop').attr('offset', '0%').attr('stop-color', d => this.color(d.source));

    gradient.append('stop').attr('offset', '100%').attr('stop-color', d => this.color(d.target));

    const linkHorizontal = sankeyLinkHorizontal();
    link.append('path').attr('d', linkHorizontal).attr('stroke', d => `url(#${d.uid})`).attr('stroke-width', d => Math.max(1, d.width));

    link.append('title').text(d => `${d.source.name} -> ${d.target.name}`);

    svg
      .append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('x', d => {
        return d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6;
      })
      .attr('y', d => {
        return (d.y1 + d.y0) / 2;
      })
      .attr('dy', '0.35em')
      .attr('text-anchor', d => {
        return d.x0 < width / 2 ? 'start' : 'end';
      })
      .text(d => {
        return `${d.sha}:${d.name}`;
      });
  }

  render() {
    return <div ref={svg => (this.ref = svg)} />;
  }

  color(record) {
    return chroma(this.colorPalette[record.sha]).alpha(0.85).hex('rgba');
  }
}

export default DataRiverChart;
