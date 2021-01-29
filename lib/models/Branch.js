'use strict';

const Model = require('./Model.js');
// eslint-disable-next-line no-unused-vars
const nodegit = require('nodegit'); // (used for JSDoc)

const Branch = Model.define('Branch', {
  attributes: ['branchKey', 'branchName', 'headShas'],
  keyAttribute: 'branchKey',
});

/**
 * Replaces all '/' with '_' in the branch name and returns it.
 * This is needed because keys in ArangoDB cannot contain '/'.
 * @param branch a {@link nodegit.Branch} from which the key should be extracted
 * @returns {string} stored key of the branch
 */
Branch.getBranchKey = function (branch) {
  return branch.name().replace(/[^a-zA-Z0-9_]+/g, '_');
};

module.exports = Branch;
