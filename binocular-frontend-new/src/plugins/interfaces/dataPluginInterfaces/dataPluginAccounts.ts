import type { DataPluginUser } from './dataPluginUsers.ts';

export interface DataPluginAccounts {
  getAll: () => Promise<DataPluginAccount[]>;
  saveAccountUserRelation: (relation: DataPluginAccount) => Promise<boolean>;
}

export interface DataPluginAccount {
  id: string;
  login?: string;
  name: string;
  user: DataPluginUser | null;
  platform: string;
}
