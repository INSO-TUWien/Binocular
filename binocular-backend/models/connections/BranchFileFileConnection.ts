'use strict';

import Connection from '../Connection';
import BranchFile, { BranchFileConnectionDao } from './BranchFileConnection';
import File, { FileDao } from '../models/File';

interface BranchFileFileConnectionDao {}

class BranchFileFileConnection extends Connection<BranchFileFileConnectionDao, BranchFileConnectionDao, FileDao> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(BranchFile, File);
  }

  async remove(conn: any) {
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
