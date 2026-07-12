export interface DataPluginLizards {
  getAll: () => Promise<DataPluginLizards[]>;
}

export interface DataPluginLizards {
  filePath: string;
  maxNloc: number;
  maxCcn: number;
  maxTokens: number;
  maxParameters: number;
  maxLength: number;
  avgNloc: number;
  avgCcn: number;
  avgTokens: number;
  avgParameters: number;
  avgLength: number;
  functionCount: number;
  maxLizardScore: number;
  avgLizardScore: number;
  normalizedMaxLizardScore: number;
  normalizedAvgLizardScore: number;
}
