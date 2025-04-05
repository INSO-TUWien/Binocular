import { DataPluginGitUser } from './dataPluginGitUser.ts';
import { DataPluginIssue } from './dataPluginIssue.ts';
import { DataPluginMergeRequest } from './DataPluginMergeRequest.ts';

export interface DataPluginNotes {
  getAll: (from: string, to: string) => Promise<DataPluginNote[]>;
}

export interface DataPluginNote {
  createdAt: string;
  updatedAt: string;
  issue: DataPluginIssue | null;
  mergeRequest: DataPluginMergeRequest | null;
  body: string;
  author: DataPluginGitUser;
}
