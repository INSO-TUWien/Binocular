export function generateTestGraph() {
  const initialGraph = {
    nodes: [
      { id: 1, label: 'Commit 1', fixed: true, x: -600, y: 100, physics: false },
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
