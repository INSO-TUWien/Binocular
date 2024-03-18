'use strict';

import Connection from './Connection';
import BranchFile from './BranchFileConnection.js';
import File from './File.js';

class BranchFileFileConnection extends Connection {
  constructor() {
    super(BranchFile, File);
  }

  async remove(conn) {
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
