'use strict';

import Connection from '../Connection.ts';
import Branch, { BranchDao } from '../models/Branch.ts';
import File, { FileDao } from '../models/File.ts';

export interface BranchFileConnectionDao {}

class BranchFileConnection extends Connection<BranchFileConnectionDao, BranchDao, FileDao> {
  constructor() {
    super(Branch, File);
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

export default new BranchFileConnection();
