import { DataPluginGitUser } from './dataPluginGitUser.ts';
import { DataPluginNote } from './dataPluginNote.ts';

export interface DataPluginIssues {
  getAll: (from: string, to: string) => Promise<DataPluginIssue[]>;
}

export interface DataPluginIssue {
  id: string;
  iid: number;
  title: string;
  //description: string;
  state: string;
  webUrl: string;
  createdAt: string;
  closedAt: string | null;
  author: DataPluginGitUser;
  assignee: DataPluginGitUser | null;
  assignees: DataPluginGitUser[];
  notes: DataPluginNote[];
}
