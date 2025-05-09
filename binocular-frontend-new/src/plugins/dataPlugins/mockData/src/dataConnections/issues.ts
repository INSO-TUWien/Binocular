import { DataPluginIssue, DataPluginIssues } from '../../../../interfaces/dataPluginInterfaces/dataPluginIssues.ts';

export default class Issues implements DataPluginIssues {
  constructor() {}

  public async getAll(from: string, to: string) {
    console.log(`Getting Issues from ${from} to ${to}`);
    return new Promise<DataPluginIssue[]>((resolve) => {
      const issues: DataPluginIssue[] = [];
      resolve(issues);
    });
  }
}
