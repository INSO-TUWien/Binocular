export const findAuthorWithMaxSpentTime = (d: Map<string, number>) => {
  const entries = d.entries();
  let max = entries.next().value;
  if (!max) {
    return '';
  }

  for (const e of entries) {
    if (max[1] > e[1]) {
      continue;
    }

    max = e;
  }

  return max[0];
};
