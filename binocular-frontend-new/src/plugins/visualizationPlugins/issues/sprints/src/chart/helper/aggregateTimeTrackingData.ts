import type { TimeTrackingData } from '../../../../timeSpent/src/utilities/dataConverter';

export const aggregateTimeTrackingData = (timeTrackingData: TimeTrackingData[]) => {
  const aggregatedTimeTrackingData = new Map<string, number>();
  let totalTime = 0;

  for (const {
    author: { name },
    timeSpent,
  } of timeTrackingData) {
    aggregatedTimeTrackingData.set(name, (aggregatedTimeTrackingData.get(name) ?? 0) + timeSpent);

    totalTime += timeSpent;
  }

  return { aggregatedTimeTrackingData, totalTime };
};
