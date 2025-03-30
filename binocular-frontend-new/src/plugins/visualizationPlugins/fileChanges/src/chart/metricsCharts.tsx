import { useEffect, useRef } from "react";
import * as d3 from "d3"; // Optional, remove if not needed

export const MetricsChart = ({ width, height, metrics }) => {
  const svgRef = useRef(null);
  const { mpc, entropy, maxburst, maxchangeset, avgchangeset } = metrics;

  const data = [
    { name: "MPC", value: mpc },
    { name: "Entropy", value: entropy },
    { name: "Maximum Burst", value: maxburst },
    { name: "Maximum Changeset", value: maxchangeset },
    { name: "Average Changeset", value: avgchangeset },
  ];

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    const barHeight = 30;
    const maxValue = 1;

    const xScale = d3.scaleLinear().domain([0, maxValue]).range([0, width]);

    svg
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", (d, i) => i * (barHeight + 5))
      .attr("width", (d) => xScale(d.value))
      .attr("height", barHeight)
      .attr("fill", "steelblue");

    svg
      .selectAll("text")
      .data(data)
      .enter()
      .append("text")
      .attr("x", 5)
      .attr("y", (d, i) => i * (barHeight + 5) + barHeight / 1.5)
      .attr("fill", "white")
      .attr("font-size", barHeight / 2 + "px")
      .text((d) => `${d.name}:`);

    svg
      .selectAll("text2")
      .data(data)
      .enter()
      .append("text")
      .attr("x", width * 0.85)
      .attr("y", (d, i) => i * (barHeight + 5) + barHeight / 1.5)
      .attr("fill", "white")
      .attr("font-size", barHeight / 2 + "px")
      .attr("text-anchor", "end")
      .text((d) => `${d.value.toFixed(2)}`);
  }, [data]);

  return (
    <div className="absolute bg-white p-6 top-1">
      <h3 className="text-m font-semibold mb-2">Metrics Overview</h3>
      <svg ref={svgRef} width={width * 0.9} height={height * 0.9}></svg>
    </div>
  );
};
