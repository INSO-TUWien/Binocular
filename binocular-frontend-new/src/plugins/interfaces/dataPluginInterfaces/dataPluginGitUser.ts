import { DataPluginUser } from './dataPluginUsers.ts';

export interface DataPluginGitUsers {
  getAll: () => Promise<DataPluginGitUser[]>;
}

export interface DataPluginGitUser {
  id: string;
  name: string;
  user: DataPluginUser;
}
