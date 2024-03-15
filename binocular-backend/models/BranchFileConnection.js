'use strict';

import Connection from './Connection';
import Branch from './Branch.js';
import File from './File.js';

const BranchFileConnection = new Connection(Branch, File);

BranchFileConnection.remove = async function (conn) {
  await BranchFileConnection.rawDb
    .query({
      query: `
        FOR conn in @@coll
        FILTER conn._key == @key
        REMOVE conn in @@coll`,
      // eslint-disable-next-line prettier/prettier
      bindVars: { '@coll': BranchFileConnection.collectionName, 'key': conn._key },
    })
    .catch((error) => console.log(error.message));
};

export default BranchFileConnection;
