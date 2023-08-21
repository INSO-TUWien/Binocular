import * as d3 from 'd3';

export async function layoutGraph(graph) {
  // Calculate positions using D3 force layout
  console.log('graph initial: ', graph);
  var graph_temp = graph;
  const simulation = d3
    .forceSimulation(graph.nodes)
    .force('charge', d3.forceManyBody().strength(-100))
    .force('link', d3.forceLink(graph.edges).distance(80))
    .force('x', d3.forceX().strength(0.1).x(1000 / 2)) // Start in the middle
    .force('y', d3.forceY().strength(0.1))
    .on('tick', () => {
      // Update commitPositions in the state with calculated positions
      graph_temp = graph.nodes.map((commit) => ({ x: commit.x, y: commit.y }));
    });

  // Start the simulation
  simulation.alpha(0.9).restart();

  return graph_temp;
}
