'use strict';

import Model from '../Model.ts';
import _ from 'lodash';

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

  async persist(_branchData: any) {
    const branchData = _.clone(_branchData);
    const instance = await this.findById(_branchData.id);
    if (!instance) {
      return this.create({
        id: branchData.id,
        branch: branchData.branchName,
        active: branchData.currentActive,
        tracksFileRenames: branchData.tracksFileRenames,
        latestCommit: branchData.latestCommit,
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
