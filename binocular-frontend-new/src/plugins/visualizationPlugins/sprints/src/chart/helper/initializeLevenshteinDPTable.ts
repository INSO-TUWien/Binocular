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
