'use strict';

import Model from './Model';

class Branch extends Model {
  constructor() {
    super('Branch', {
      attributes: ['id', 'branch', 'active', 'tracksFileRenames', 'latestCommit'],
      keyAttribute: 'id',
    });
  }

  async persist(nBranch) {
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

  async remove(branch) {
    await this.rawDb.query({
      query: `FOR branch in ${this.collectionName}
    FILTER branch._key == @key
    REMOVE branch in ${this.collectionName}`,
      bindVars: { key: branch._key },
    });
  }
}

export default new Branch();
