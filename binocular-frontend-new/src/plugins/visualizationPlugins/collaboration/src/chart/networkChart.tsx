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
    console.error("No data nodes found");
    return <div>No Data Plugin Selected</div>;
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

    // A group for drawing the hulls (borders) behind nodes and links
    const borderGroup = container.append("g").attr("class", "borders");
    // Radius of each node's circle
    const nodeRadius = 10;
    // How many points to sample around each node for the hull
    const expansionPoints = 12;

    //simulate forces between nodes
    const simulation = d3
      .forceSimulation<NodeType>(data.nodes)
      .force(
        "link",
        d3
          .forceLink<NodeType, LinkType>(data.links)
          .id((d) => d.id)
          .distance(10), //TODO: tweak or make setting
      )
      .force("charge", d3.forceManyBody().strength(30)) //TODO: tweak or make setting
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
            if (!event.active) simulation.alphaTarget(0.003).restart();
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

      // Group nodes by their group property
      const groups = d3.group(data.nodes, (d) => d.group);

      // For each group, compute the convex hull and update or create a border path
      // Bind data as an array of [groupKey, nodesArray]
      // Bind hull data to paths
      const hullSelection = borderGroup
        .selectAll("path.hull")
        .data(Array.from(groups.entries()), (d: any) => d[0]);

      // Update existing hulls
      hullSelection
        .attr("d", ([groupKey, nodes]) => {
          const hullPath = computeHullPath(nodes);
          return hullPath;
        })
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2);

      // Enter new hulls
      hullSelection
        .enter()
        .append("path")
        .attr("class", "hull")
        .attr("d", ([groupKey, nodes]) => computeHullPath(nodes))
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2);

      // Remove old hulls
      hullSelection.exit().remove();
    });

    // Helper to compute a polygon hull around the node circle expansions
    function computeHullPath(nodes: NodeType[]) {
      // Build an array of [x, y] for each node, but expanded around nodeRadius
      // to ensure the hull encloses the circle. We'll sample a circle around each node.
      const points: [number, number][] = [];
      nodes.forEach((node) => {
        const cx = node.x ?? 0;
        const cy = node.y ?? 0;
        for (let i = 0; i < expansionPoints; i++) {
          const angle = (2 * Math.PI * i) / expansionPoints;
          const x = cx + nodeRadius * Math.cos(angle);
          const y = cy + nodeRadius * Math.sin(angle);
          points.push([x, y]);
        }
      });

      // Compute the convex hull
      const hull = d3.polygonHull(points);
      if (!hull) return "";

      // Use a line generator with a closed curve
      const lineGenerator = d3.line().curve(d3.curveBasisClosed);
      return lineGenerator(hull) ?? "";
    }

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
