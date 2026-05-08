import type { DataPluginMergeRequest } from './dataPluginMergeRequests.ts';

export interface DataPluginAccountsMergeRequests {
  getAll: (from: string, to: string) => Promise<DataPluginAccountMergeRequests[]>;
}

export interface DataPluginAccountMergeRequests {
  id: string;
  login: string;
  name: string;
  avatarUrl: string;
  url: string;
  mergeRequests: DataPluginMergeRequest[];
}
