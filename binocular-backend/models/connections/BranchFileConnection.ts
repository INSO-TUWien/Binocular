'use strict';

import Connection, { Entry } from '../Connection';
import Branch, { BranchDataType } from '../models/Branch';
import File, { FileDataType } from '../models/File';

export interface BranchFileConnectionDataType {}

class BranchFileConnection extends Connection<BranchFileConnectionDataType, BranchDataType, FileDataType> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(Branch, File);
  }

  async remove(conn: Entry<BranchFileConnectionDataType>) {
    if (this.rawDb === undefined) {
      throw Error('Database undefined!');
    }
    await this.rawDb
      .query({
        query: `
        FOR conn in @@coll
        FILTER conn._key == @key
        REMOVE conn in @@coll`,
        // eslint-disable-next-line prettier/prettier
        bindVars: { '@coll': this.collectionName, 'key': conn._key },
      })
      .catch((error) => console.log(error.message));
  }
}

export default new BranchFileConnection();
