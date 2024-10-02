import { DataPluginGeneral } from './dataPluginInterfaces/dataPluginGeneral.ts';
import { DataPluginCommits } from './dataPluginInterfaces/dataPluginCommits.ts';
import { DataPluginUsers } from './dataPluginInterfaces/dataPluginUsers.ts';
import { DataPluginFiles } from './dataPluginInterfaces/dataPluginFiles.ts';

export interface DataPlugin {
  name: string;
  description: string;
  general: DataPluginGeneral;
  commits: DataPluginCommits;
  users: DataPluginUsers;
  files: DataPluginFiles;
  capabilities: string[];
  experimental: boolean;
  requirements: { apiKey: boolean; endpoint: boolean; file: boolean };
  init: (
    apiKey: string | undefined,
    endpoint: string | undefined,
    file: { name: string | undefined; file: File | undefined } | undefined,
  ) => Promise<void>;
  clearRemains: () => Promise<void>;
}
