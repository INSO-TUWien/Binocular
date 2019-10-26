import React from "react";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import chroma from "chroma-js";
import styles from './styles.scss';

function pathColor(link) {

    return chroma('white');

}

const SankeyNode = ({ name,lines, x0, x1, y0, y1, color }) => (
  <rect x={x0} y={y0} width={x1 - x0 } height={y1 - y0} fill={color}>
    <title>{name}, owner of {lines} lines</title>
  </rect>
);

const SankeyLink = ({ link, color }) => (
    <path
      d={sankeyLinkHorizontal()(link)}
      style={{
        fill: "none",
        strokeOpacity: ".3",
        stroke: color,
        strokeWidth: Math.max(2, link.width)
      }}
    />
);

const MysteriousSankey = ({ data, width, height }) => {
  const { nodes, links } = sankey()
    .nodeWidth(15)
    .nodePadding(10)
    .extent([[1, 1], [width - 1, height - 5]])(data);


  const color = chroma.scale("Set3").classes(nodes.length);
  const colorScale = d3
    .scaleLinear()
    .domain([0, nodes.length])
    .range([0, 1]);

  return (
    <g style={{ mixBlendMode: "multiply" }}>
      {nodes.map((node, i) => (
        <SankeyNode
          {...node}
          lines={node.value}
          color={node.color}
          key={node.name + ' ' + node.commit}
        />
      ))}
      {links.map((link, i) => (
        <SankeyLink
          link={link}
          color={link.width === 0 ? chroma('white') : color(colorScale(link.source.color)).hex()}
        />
      ))}
    </g>
  );
};

export default MysteriousSankey;
