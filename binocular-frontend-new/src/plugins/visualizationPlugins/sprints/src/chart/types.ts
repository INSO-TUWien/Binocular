import type { Moment } from 'moment';
import type { DataPluginIssue } from '../../../../interfaces/dataPluginInterfaces/dataPluginIssues';
import type { DataPluginMergeRequest } from '../../../../interfaces/dataPluginInterfaces/dataPluginMergeRequests';
import type { SprintType } from '../../../../../types/data/sprintType';

export type MappedDataPluginIssue = Omit<
  DataPluginIssue,
  'createdAt' | 'closedAt' | 'labels'
> &
  Record<'createdAt' | 'closedAt', Moment> & {
    labels: { name: string; color: string }[];
  };

export type MappedDataPluginMergeRequest = Omit<
  DataPluginMergeRequest,
  'createdAt' | 'closedAt'
> &
  Record<'createdAt' | 'closedAt', Moment>;

export type MappedSprintType = Omit<SprintType, 'startDate' | 'endDate'> &
  Record<'startDate' | 'endDate', Moment>;
