'use strict';

import Connection, { Entry } from '../Connection';
import BranchFile, { BranchFileConnectionDataType } from './BranchFileConnection';
import File, { FileDataType } from '../models/File';

interface BranchFileFileConnectionDataType {}

class BranchFileFileConnection extends Connection<BranchFileFileConnectionDataType, BranchFileConnectionDataType, FileDataType> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(BranchFile, File);
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

export default new BranchFileFileConnection();
