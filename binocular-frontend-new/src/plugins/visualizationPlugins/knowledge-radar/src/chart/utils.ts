export const createGradients = (defs: d3.Selection<SVGDefsElement, unknown, null, undefined>, colorScheme: any) => {
  // Radial gradient for background
  const radialGradient = defs.append("radialGradient")
    .attr("id", "radar-background-gradient")
    .attr("cx", "50%")
    .attr("cy", "50%")
    .attr("r", "50%");

  radialGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#ffffff");

  radialGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#f0f0f0");

  // Linear gradient for radar area
  const linearGradient = defs.append("linearGradient")
    .attr("id", "radar-area-gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "100%");

  linearGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", `${colorScheme.primary}`)
    .attr("stop-opacity", "0.7");

  linearGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", `${colorScheme.highlight}`)
    .attr("stop-opacity", "0.5");
};
