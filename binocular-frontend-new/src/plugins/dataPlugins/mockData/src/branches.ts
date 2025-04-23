import {
  DataPluginBranch,
  DataPluginBranches,
} from "../../../interfaces/dataPluginInterfaces/dataPluginBranches.ts";

export default class Branches implements DataPluginBranches {
  public async getAllBranches(): Promise<DataPluginBranch[]> {
    return Promise.resolve([{
      branch: 'develop',
      active: false,
      tracksFileRenames: true,
      latestCommit: '5f13d85a7c3a2e62711e5e78f79f04854ecc5907',
    }])
  }
}
