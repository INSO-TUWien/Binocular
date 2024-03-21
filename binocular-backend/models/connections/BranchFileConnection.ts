'use strict';

import Connection, { Entry } from '../Connection';
import Branch, { BranchDao } from '../models/Branch';
import File, { FileDao } from '../models/File';

export interface BranchFileConnectionDao {}

class BranchFileConnection extends Connection<BranchFileConnectionDao, BranchDao, FileDao> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(Branch, File);
  }

  async remove(conn: Entry<BranchFileConnectionDao>) {
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
