/**
 * Initializes the dynamic programming table used for the levenshtein distance.
 * @param a Base value
 * @param b Comparison value
 * @returns The initialized array of arrays.
 *          The first row and column are initialized with the number of the index
 *          All other cells are initialized with `-1`
 * ```json
 * [ [0, 1, 2, 3, 4, 5, 6, 7],
 *     [1, -1, -1, -1, -1, -1, -1, -1],
 *     [2, -1, -1, -1, -1, -1, -1, -1],
 *     [3, -1, -1, -1, -1, -1, -1, -1], ]
 * ```
 */
export const initializeLevenshteinDPTable = (a: string, b: string) => {
  const dpTable: number[][] = [];

  const aChars = ['', ...a];
  const bChars = ['', ...b];

  for (let i = 0; i < aChars.length; i++) {
    const row: number[] = [];
    dpTable[i] = row;

    for (let j = 0; j < bChars.length; j++) {
      row[j] = i === 0 ? j : j === 0 ? i : -1;
    }
  }

  return dpTable;
};
