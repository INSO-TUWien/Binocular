import type { IssuesGroupedByGranularity } from '../types';

export function* pairUpDataPoints(data: IssuesGroupedByGranularity[]) {
  for (let i = 1; i < data.length; i++) {
    yield [data[i - 1], data[i]] as const;
  }
}
