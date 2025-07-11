import { DataPluginIssue, DataPluginIssues } from '../../../interfaces/dataPluginInterfaces/dataPluginIssues.ts';

export default class Issues implements DataPluginIssues {
  constructor() {}
  public async getAll() {
    return await Promise.resolve(this.getIssues());
  }
  private async getIssues(): Promise<DataPluginIssue[]> {
    // TODO: find out if implementation is needed in any near future?
    await new Promise((resolve) => setTimeout(resolve, 10));
    return [];
  }
}
