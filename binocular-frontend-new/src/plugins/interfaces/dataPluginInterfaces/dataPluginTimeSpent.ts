import { DataPluginUser } from './dataPluginUsers.ts';

export interface DataPluginTimeSpents {
  getAll: (from: string, to: string) => Promise<DataPluginTimeSpent[]>;
}

export interface DataPluginTimeSpent {
  title: string;
  notes: DataPluginNote[];
  creator: DataPluginUser;
}

export interface DataPluginNote {
  createdAt: string;
  updatedAt: string;
  body: string;
  author: DataPluginUser;
}
