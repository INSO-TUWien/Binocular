import type { Moment } from "moment";
import type { DataPluginIssue } from "../../../../interfaces/dataPluginInterfaces/dataPluginIssues";
import type { DataPluginMergeRequest } from "../../../../interfaces/dataPluginInterfaces/dataPluginMergeRequests";

export type MappedDataPluginIssue = Omit<
  DataPluginIssue,
  'createdAt' | 'closedAt'
> &
  Record<'createdAt' | 'closedAt', Moment>;

export type MappedDataPluginMergeRequest = Omit<
  DataPluginMergeRequest,
  'createdAt' | 'closedAt'
> &
  Record<'createdAt' | 'closedAt', Moment>;