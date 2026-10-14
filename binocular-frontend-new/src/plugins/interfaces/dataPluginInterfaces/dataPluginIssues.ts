import type { DataPluginAccount } from './dataPluginAccounts.ts';
import type { DataPluginStats } from './dataPluginCommits.ts';
import type { DataPluginNote } from './dataPluginNotes.ts';

export interface DataPluginIssues {
  getAll: (from: string, to: string) => Promise<DataPluginIssue[]>;
}

// A commit as referenced from an issue or merge request
export interface DataPluginIssueCommitStats {
  sha: string;
  date: string;
  stats: DataPluginStats;
}

export interface DataPluginIssueMergeRequest {
  iid: number;
  commits: DataPluginIssueCommitStats[];
}

export interface DataPluginIssue {
  id: string;
  iid: number;
  title: string;
  description: string;
  state: string;
  webUrl: string;
  createdAt: string;
  closedAt: string | null;
  labels: string[];
  author: DataPluginAccount | null;
  assignee: DataPluginAccount | null;
  assignees: DataPluginAccount[];
  notes: DataPluginNote[];
  commits: DataPluginIssueCommitStats[];
  mergeRequests: DataPluginIssueMergeRequest[];
}
