import { initializeLevenshteinDPTable } from './initializeLevenshteinDPTable';

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
      const deleteOpCost = dpTable[i][j - 1];
      const replaceOpCost = dpTable[i - 1][j - 1];
      const insertOpCost = dpTable[i - 1][j];

      const minOpCost = Math.min(deleteOpCost, replaceOpCost, insertOpCost);

      dpTable[i][j] = a[i - 1] === b[j - 1] ? minOpCost : minOpCost + 1;
    }
  }

  return dpTable.at(-1)?.at(-1) ?? 0;
};
