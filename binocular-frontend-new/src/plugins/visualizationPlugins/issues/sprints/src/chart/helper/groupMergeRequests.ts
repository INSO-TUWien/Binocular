import type { MappedDataPluginMergeRequest } from '../types';

/**
 * Groups together merge requests within the same month.
 * @param mergeRequests
 * @returns An array of merge request groups.
 */
export const groupMergeRequests = (mergeRequests: MappedDataPluginMergeRequest[]) => {
  const map = new Map<string, MappedDataPluginMergeRequest[]>();
  for (const mr of mergeRequests) {
    const key = mr.createdAt.format('YYYY-MM');
    if (!map.has(key)) {
      map.set(key, [mr]);
      continue;
    }

    map.get(key)?.push(mr);
  }

  return [...map.values()];
};
