import { initializeLevenshteinMatrix } from './initializeLevenshteinMatrix';

interface Point {
  value: string;
  index: number;
  label: number;
}

export const defaultLabelGroupId = -1;

export const groupSimilarLabels = (strings: string[], epsilon = 3, minPoints = 2) => {
  const matrix = initializeLevenshteinMatrix(strings);

  const points: Point[] = strings.map((p, i) => ({
    index: i,
    value: p,
    label: defaultLabelGroupId,
  }));

  let clusterId = 0;
  for (const p of points) {
    // Only process unlabelled points
    if (p.label !== defaultLabelGroupId) {
      continue;
    }
    // Get all the points neighbors
    let neighbors = rangeQuery(p, points, epsilon, matrix);
    // Check if point is noise
    if (neighbors.length < minPoints) {
      p.label = 0;
      continue;
    }
    // Next cluster label
    clusterId += 1;
    // Label initial point
    p.label = clusterId;
    // Remove point p from n
    let neighborsWithoutCurrentPoint = neighbors.filter((neighbor) => neighbor.index !== p.index);
    // Process every seed point
    while (neighborsWithoutCurrentPoint.length > 0) {
      const n = neighborsWithoutCurrentPoint.pop();
      if (!n) {
        break;
      }
      // Change noise to border
      if (n.label === 0) {
        n.label = clusterId;
      }
      // Previously processed
      if (n.label !== defaultLabelGroupId) {
        continue;
      }
      // Label neighbor
      n.label = clusterId;
      // Find neighbors
      neighbors = rangeQuery(n, points, epsilon, matrix);
      // Add new neighbors to seed
      if (neighbors.length >= minPoints) {
        neighborsWithoutCurrentPoint = [...neighborsWithoutCurrentPoint, ...neighbors];
      }
    }
  }

  const map = new Map<number, Array<string>>();

  for (const p of points) {
    const key = p.label - 1;
    if (!map.has(key)) {
      map.set(key, []);
    }

    map.get(key)?.push(p.value);
  }

  return map;
};

const rangeQuery = (
  current: Point,
  data: Point[],
  epsilon: number,
  matrix: Map<string, Map<string, number>>,
) =>
  data.filter(
    (point) =>
      (matrix.get(point.value)?.get(current.value) ??
        Number.POSITIVE_INFINITY) <= epsilon,
  );
