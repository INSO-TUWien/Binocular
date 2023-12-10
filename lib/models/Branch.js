'use strict';

import { aql } from 'arangojs';
import Model from './Model.js';

const Branch = Model.define('Branch', {
  attributes: ['id', 'branch', 'active', 'tracksFileRenames', 'latestCommit'],
  keyAttribute: 'id',
});

Branch.persist = function (nBranch) {
  return Branch.findById(nBranch.id).then(function (instance) {
    if (!instance) {
      return Branch.create({
        id: nBranch.id,
        branch: nBranch.branchName,
        active: nBranch.currentActive,
        tracksFileRenames: nBranch.tracksFileRenames,
        latestCommit: nBranch.latestCommit,
      }).then((branch) => [branch, true]);
    }
    return [instance, false];
  });
};

Branch.remove = async function (branch) {
  await Branch.rawDb.query({
    query: `FOR branch in ${Branch.collectionName}
    FILTER branch._key == @key
    REMOVE branch in ${Branch.collectionName}`,
    bindVars: { key: branch._key },
  });
};

export default Branch;
