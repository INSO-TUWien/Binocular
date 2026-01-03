import { levenshteinDistance } from './levenshteinDistance';

/**
 * Calculate the distance for each string in the `strings` Array.
 * @param strings Array of strings that should be compared
 * @returns A Map of Maps, that contain all possible distances between all strings.
 */
export const initializeLevenshteinMatrix = (strings: string[]) => {
  const matrix = new Map<string, Map<string, number>>();

  for (let i = 0; i < strings.length; i++) {
    const a = strings[i];
    // If the key doesn' already exist, initialize a new map.
    if (!matrix.has(a)) {
      matrix.set(a, new Map());
    }

    // Iterate over all left strings, starting from i.
    // Can be done, since both variants of the key access are set in one step.
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
