'use strict';

import Connection from './Connection';
import BranchFile from './BranchFileConnection.js';
import File from './File.js';

const BranchFileFileConnection = new Connection(BranchFile, File);

BranchFileFileConnection.remove = async function (conn) {
  await BranchFileFileConnection.rawDb
    .query({
      query: `
        FOR conn in @@coll
        FILTER conn._key == @key
        REMOVE conn in @@coll`,
      // eslint-disable-next-line prettier/prettier
      bindVars: { '@coll': BranchFileFileConnection.collectionName, 'key': conn._key },
    })
    .catch((error) => console.log(error.message));
};

export default BranchFileFileConnection;
