import { levenshteinDistance } from './levenshteinDistance';

export const initializeLevenshteinMatrix = (strings: string[]) => {
  const matrix = new Map<string, Map<string, number>>();

  for (let i = 0; i < strings.length; i++) {
    const a = strings[i];
    if (!matrix.has(a)) {
      matrix.set(a, new Map());
    }

    for (let j = i; j < strings.length; j++) {
      const b = strings[j];
      if (!matrix.has(b)) {
        matrix.set(b, new Map());
      }

      const distance = levenshteinDistance(a, b);

      matrix.get(a)?.set(b, distance);
      matrix.get(b)?.set(a, distance);
    }
  }

  return matrix;
};
