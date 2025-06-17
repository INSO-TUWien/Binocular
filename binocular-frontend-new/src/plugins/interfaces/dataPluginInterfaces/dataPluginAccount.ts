import { DataPluginIssue } from "./dataPluginIssues.ts";

export interface DataPluginAccounts {
  getAll: (from: string, to: string) => Promise<DataPluginAccount[]>;
}

export interface DataPluginAccount {
  id: string;
  login: string;
  name: string;
  avatarUrl: string;
  url: string;
  issues: DataPluginIssue[];
}
