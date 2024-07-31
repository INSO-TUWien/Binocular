import { DataPluginGeneral } from './dataPluginInterfaces/dataPluginGeneral.ts';
import { DataPluginCommits } from './dataPluginInterfaces/dataPluginCommits.ts';
import { DataPluginAuthors } from './dataPluginInterfaces/dataPluginAuthors.ts';
import { DataPluginFiles } from './dataPluginInterfaces/dataPluginFiles.ts';

export interface DataPlugin {
  name: string;
  description: string;
  general: DataPluginGeneral;
  commits: DataPluginCommits;
  authors: DataPluginAuthors;
  files: DataPluginFiles;
  capabilities: string[];
  experimental: boolean;
  requirements: { apiKey: boolean; endpoint: boolean };
  setApiKey: (apiKey: string) => void;
}
