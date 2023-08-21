export async function layoutDagreGraph() {
  const d3 = require('d3');
  const d3Dag = require('d3-dag');

  const dag = d3Dag.digraph();

  dag.addNode('A');
  dag.addNode('B');
  dag.addNode('C');
  dag.addNode('D');

  dag.addEdge(null, 'A', 'B'); // A → B
  dag.addEdge(null, 'A', 'C'); // A → C
  dag.addEdge(null, 'B', 'D'); // B → D
  dag.addEdge(null, 'C', 'D'); // C → D

  const layout = d3Dag.sugiyama();
  const layoutData = layout(dag);

  const nodePositions = layoutData.descendants().map(node => ({
    id: node.id,
    x: node.x,
    y: node.y,
  }));

  console.log('pos',nodePositions);
}
