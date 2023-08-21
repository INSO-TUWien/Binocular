export function generateTestGraph() {
  const initialGraph = {
    nodes: [
      { id: 1, label: 'Commit 1' },
      { id: 2, label: 'Commit 2' },
      { id: 3, label: 'Commit 3' },
      { id: 4, label: 'Commit 4' },
      { id: 5, label: 'Commit 5' },
      { id: 6, label: 'Commit 6' },
      { id: 7, label: 'Commit 7' },
      { id: 8, label: 'Commit 8' },
      { id: 9, label: 'Commit 9' },
      { id: 10, label: 'Commit 10' },
      { id: 11, label: 'Commit 11' },
      { id: 12, label: 'Commit 12' },
      { id: 13, label: 'Commit 13' },
      { id: 14, label: 'Commit 14' },
      { id: 15, label: 'Commit 15' },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 4 },
      { from: 2, to: 5 },
      { from: 3, to: 6 },
      { from: 3, to: 7 },
      { from: 4, to: 8 },
      { from: 4, to: 9 },
      { from: 5, to: 10 },
      { from: 5, to: 11 },
      { from: 6, to: 12 },
      { from: 6, to: 13 },
      { from: 7, to: 14 },
      { from: 7, to: 15 },
    ],
  };

  return initialGraph;
}

export function generateKonvaGraph() {
  const initialGraph = {
    nodes: [
      { id: 0, label: 'Commit 0', x: 25, y: 300 },
      { id: 1, label: 'Commit 1', x: 50, y: 300 },
      { id: 2, label: 'Commit 2', x: 75, y: 300 },
      { id: 3, label: 'Commit b1 1', x: 100, y: 350 },
      { id: 4, label: 'Commit b2 2', x: 125, y: 350 },
      { id: 5, label: 'Commit b3 3', x: 150, y: 350 },
      { id: 6, label: 'Commit 4', x: 100, y: 300 },
      { id: 7, label: 'Commit 5', x: 125, y: 300 },
      { id: 8, label: 'Commit 6', x: 150, y: 300 },
      { id: 9, label: 'Commit 7', x: 175, y: 300 },
    ],
    edges: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 },
      { from: 3, to: 4 },
      { from: 4, to: 5 },
      { from: 2, to: 6 },
      { from: 6, to: 7 },
      { from: 7, to: 8 },
      { from: 8, to: 9 },
    ],
  };

  return initialGraph;
}

export function generateSimpleGraph() {
  const initialGraph = {
    nodes: [
      { index: 0, label: 'Commit 1' },
      { index: 1, label: 'Commit 2' },
      { index: 2, label: 'Commit 2' },
      { index: 3, label: 'Commit 2' },
      { index: 4, label: 'Commit 2' },
      { index: 5, label: 'Commit 2' },
    ],
    edges: [
      { source: 0, target: 1 },
      { source: 1, target: 2 },
      { source: 1, target: 3 },
      { source: 3, target: 4 },
      { source: 2, target: 5 },
    ],
  };

  return initialGraph;
}
