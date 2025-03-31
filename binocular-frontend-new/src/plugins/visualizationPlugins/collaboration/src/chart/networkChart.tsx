import { useEffect, useRef } from "react";
import * as d3 from "d3";

/**
 * TODO: credit https://www.react-graph-gallery.com?
 */

const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };

interface NodeType extends d3.SimulationNodeDatum {
  id: string;
  group: string;
}

interface LinkType extends d3.SimulationLinkDatum<NodeType> {
  source: string | NodeType;
  target: string | NodeType;
  value: number;
}

//type LinkType = { source: string; target: string; value: number };

type NetworkData = {
  nodes: NodeType[];
  links: LinkType[];
};

type NetworkChartProps = {
  width: number;
  height: number;
  data: NetworkData;
  color: string;
};

export const NetworkChart = ({
  width,
  height,
  data,
  color,
}: NetworkChartProps) => {
  if (!data || !data.nodes || !data.links) {
    return <div>No data available</div>;
  }
  if (data && data.nodes) {
    for (let i = 0; i < data.nodes.length; i++) {
      console.log(data.nodes[i]);
    }
  }

  const svgRef = useRef<SVGElement | null>(null);
  // bounds = area inside the graph axis = calculated by substracting the margins
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  useEffect(() => {
    const svgElement = d3.select(svgRef.current);
    // Remove any previous content before rendering
    svgElement.selectAll("*").remove();

    // Append a group element to account for margins
    const container = svgElement
      .append("g")
      .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

    //simulate forces between nodes
    const simulation = d3
      .forceSimulation<NodeType>(data.nodes)
      .force(
        "link",
        d3
          .forceLink<NodeType, LinkType>(data.links)
          .id((d) => d.id)
          .distance(10), //TODO: tweak or even setting
      )
      .force("charge", d3.forceManyBody().strength(30)) //TODO: tweak or even setting
      .force("center", d3.forceCenter(boundsWidth / 2, boundsHeight / 2))
      .force("collide", d3.forceCollide(20))
      .alphaTarget(0.0005)
      .restart();

    // Draw the links
    const link = container
      .append("g")
      .attr("stroke", "#000")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(data.links)
      .enter()
      .append("line")
      .attr("stroke-width", (d) => Math.sqrt(d.value));

    // Draw the nodes as circles
    const node = container
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(data.nodes)
      .enter()
      .append("circle")
      .attr("r", 5)
      .attr("fill", color)
      .call(
        d3
          .drag<SVGCircleElement, NodeType>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }),
      );

    // Update positions on every tick of the simulation
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as NodeType).x!)
        .attr("y1", (d) => (d.source as NodeType).y!)
        .attr("x2", (d) => (d.target as NodeType).x!)
        .attr("y2", (d) => (d.target as NodeType).y!);

      node.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
    });

    // Clean up on component unmount
    return () => {
      simulation.stop();
    };
  }, [data, boundsWidth, boundsHeight, color]);

  return (
    <div>
      <svg ref={svgRef} width={boundsWidth} height={boundsHeight} />
    </div>
  );
};
