import type { Moment } from 'moment';
import type { DataPluginIssue } from '../../../../interfaces/dataPluginInterfaces/dataPluginIssues';

export interface MappedIssue extends Omit<DataPluginIssue, 'createdAt' | 'closedAt'> {
  createdAt: Moment;
  closedAt: Moment;
}

export interface IssuesGroupedByGranularity {
  id: number;
  date: Moment;
  issues: MappedIssue[];
}
