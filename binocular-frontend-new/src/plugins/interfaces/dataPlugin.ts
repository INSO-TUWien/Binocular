import type { DataPluginGeneral } from './dataPluginInterfaces/dataPluginGeneral.ts';
import type { DataPluginCommits } from './dataPluginInterfaces/dataPluginCommits.ts';
import type { DataPluginUsers } from './dataPluginInterfaces/dataPluginUsers.ts';
import type { DataPluginBuilds } from './dataPluginInterfaces/dataPluginBuilds.ts';
import type { DataPluginFiles, FileConfig, JSONObject } from './dataPluginInterfaces/dataPluginFiles.ts';
import type { ProgressUpdateConfig } from '../../types/settings/databaseSettingsType.ts';
import type { DataPluginIssues } from './dataPluginInterfaces/dataPluginIssues.ts';
import type { DataPluginNotes } from './dataPluginInterfaces/dataPluginNotes.ts';
import type { DataPluginAccounts } from './dataPluginInterfaces/dataPluginAccounts.ts';
import type { DataPluginBranches } from './dataPluginInterfaces/dataPluginBranches.ts';
import type { DataPluginMergeRequests } from './dataPluginInterfaces/dataPluginMergeRequests.ts';
import type { DataPluginAccountsIssues } from './dataPluginInterfaces/dataPluginAccountsIssues.ts';
import type { DataPluginAccountsMergeRequests } from './dataPluginInterfaces/dataPluginAccountsMergeRequests.ts';
import type { DataPluginCommitsFiles } from './dataPluginInterfaces/dataPluginCommitsFiles.ts';
import type { DataPluginLizards } from './dataPluginInterfaces/dataPluginLizards.ts';
import type { MetadataType } from '../../types/data/MetadataType.ts';
import type { VisualizationPluginMetadataCategory } from './visualizationPluginInterfaces/visualizationPluginMetadata.ts';

export interface DataPlugin {
  name: string;
  description: string;
  general: DataPluginGeneral;
  commits: DataPluginCommits;
  builds: DataPluginBuilds;
  commitByFile: DataPluginCommitsFiles;
  issues: DataPluginIssues;
  mergeRequests: DataPluginMergeRequests;
  notes: DataPluginNotes;
  users: DataPluginUsers;
  accounts: DataPluginAccounts;
  files: DataPluginFiles;
  accountsIssues: DataPluginAccountsIssues;
  accountsMergeRequests: DataPluginAccountsMergeRequests;
  branches: DataPluginBranches;
  lizards: DataPluginLizards;
  capabilities: VisualizationPluginMetadataCategory[];
  experimental: boolean;
  requirements: { apiKey: boolean; endpoint: boolean; file: boolean; progressUpdate: boolean };
  init: (
    apiKey: string | undefined,
    endpoint: string | undefined,
    fileConfig: FileConfig | undefined,
    progressUpdateConfig: ProgressUpdateConfig | undefined,
    setUploadInfo: (message: string) => void | undefined,
  ) => Promise<MetadataType | undefined>;
  clearRemains: () => Promise<void>;
  export?: () => Promise<{ [id: string]: JSONObject[] }>;
}
