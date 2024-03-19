'use strict';

import Connection from './Connection';
import Branch from './Branch';
import File from './File.js';

class BranchFileConnection extends Connection {
  constructor() {
    super(Branch, File);
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

export default new BranchFileConnection();
