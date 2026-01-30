import { initializeLevenshteinDPTable } from './initializeLevenshteinDPTable';

/**
 * Calculate the levenshtein distance between two strings.
 * The distances signals how many delete, insert or replace operations are needed to turn string `a` into `b`.
 * @param a Base value
 * @param b Comparison value
 * @returns The distance between `a` and `b`.
 */
export const levenshteinDistance = (a: string, b: string) => {
  if (a === b) {
    return 0;
  }
  if (a.length === 0) {
    return b.length;
  }
  if (b.length === 0) {
    return a.length;
  }

  const dpTable = initializeLevenshteinDPTable(a, b);

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      // Load all possible costs.
      const deleteOpCost = dpTable[i][j - 1];
      const replaceOpCost = dpTable[i - 1][j - 1];
      const insertOpCost = dpTable[i - 1][j];

      // The minimum cost is the operation chosen.
      const minOpCost = Math.min(deleteOpCost, replaceOpCost, insertOpCost);

      // Set new cost.
      // If the current char of a and b are the same, no operation is needed.
      dpTable[i][j] = a[i - 1] === b[j - 1] ? minOpCost : minOpCost + 1;
    }
  }

  // Access the last cell and return it.
  return dpTable.reverse()[0]?.reverse()[0] ?? 0;
};
