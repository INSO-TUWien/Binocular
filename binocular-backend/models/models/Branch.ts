'use strict';

import Model from '../Model.ts';

export interface BranchDao {
  id: string;
  branch: string;
  active: boolean;
  trackFileRenames: boolean;
  latestCommit: string;
}

class Branch extends Model<BranchDao> {
  constructor() {
    super({
      name: 'Branch',
      keyAttribute: 'id',
    });
  }

  async persist(nBranch: any) {
    const instance = await this.findById(nBranch.id);
    if (!instance) {
      return this.create({
        id: nBranch.id,
        branch: nBranch.branchName,
        active: nBranch.currentActive,
        tracksFileRenames: nBranch.tracksFileRenames,
        latestCommit: nBranch.latestCommit,
      }).then((branch) => [branch, true]);
    }
    return [instance, false];
  }

  async remove(branch: any) {
    if (this.rawDb === undefined) {
      throw Error('Database undefined!');
    }
    await this.rawDb.query({
      query: `FOR branch in ${this.collectionName}
    FILTER branch._key == @key
    REMOVE branch in ${this.collectionName}`,
      bindVars: { key: branch._key },
    });
  }
}

export default new Branch();
