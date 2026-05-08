import type { DataPluginAccountMergeRequests } from '../../../../interfaces/dataPluginInterfaces/dataPluginAccountsMergeRequests.ts';

export default {
  getAll: () => {
    return new Promise<DataPluginAccountMergeRequests[]>((resolve) => {
      const accountIssues: DataPluginAccountMergeRequests[] = [];
      resolve(accountIssues);
    });
  },
};
