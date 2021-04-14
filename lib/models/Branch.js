'use strict';

const Model = require('./Model.js');

const Branch = Model.define('Branch', {
  attributes: ['id', 'branch', 'active'],
  keyAttribute: 'id'
});

Branch.persist = function(nBranch) {
  return Branch.findById(nBranch.id).then(function(instance) {
    if (!instance) {
      return Branch.create({
        id: nBranch.id,
        branch: nBranch.branchName,
        active: nBranch.currentActive
      }).then(branch => [branch, true]);
    }
    return [instance, false];
  });
};

module.exports = Branch;
