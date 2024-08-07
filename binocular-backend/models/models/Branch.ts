'use strict';

import Model, { Entry } from '../Model';
import _ from 'lodash';
import BranchDto from '../../types/dtos/BranchDto';

export interface BranchDataType {
  id: string;
  branch: string;
  active: boolean;
  tracksFileRenames: boolean;
  latestCommit: string;
}

class Branch extends Model<BranchDataType> {
  constructor() {
    super({
      name: 'Branch',
      keyAttribute: 'id',
    });
  }

  async persist(_branchData: BranchDto) {
    const branchData = _.clone(_branchData);
    const instance = await this.findOneByExample({ id: _branchData.id });
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

  async remove(branch: Entry<BranchDataType>) {
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
