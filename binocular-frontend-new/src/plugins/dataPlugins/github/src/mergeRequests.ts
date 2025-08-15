import type { DataPluginMergeRequest, DataPluginMergeRequests } from '../../../interfaces/dataPluginInterfaces/dataPluginMergeRequests.ts';

export default class MergeRequests implements DataPluginMergeRequests {
  constructor() {}
  public async getAll() {
    return await Promise.resolve(this.getMergeRequests());
  }
  private async getMergeRequests(): Promise<DataPluginMergeRequest[]> {
    // TODO: find out if implementation is needed in any near future?
    await new Promise((resolve) => setTimeout(resolve, 10));
    return [];
  }
}
