import { DataPluginIssue } from "./dataPluginIssues.ts";

export interface DataPluginAccount {
  id: string;
  login: string;
  name: string;
  avatarUrl: string;
  url: string;
  issues: DataPluginIssue[];
}

export interface DataPluginAccounts {
  getAll: () => Promise<DataPluginAccount[]>;
}
