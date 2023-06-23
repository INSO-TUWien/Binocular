'use strict';

const _ = require('lodash');
const Model = require('./Model.js');

const MergeRequest = Model.define('MergeRequest', {
  attributes: [
    'id',
    'iid',
    'title',
    'description',
    'state',
    'createdAt',
    'updatedAt',
    'labels',
    'milestone',
    'author',
    'assignee',
    'assignees',
    'userNotesCount',
    'upvotes',
    'downvotes',
    'webUrl',
    'reference',
    'references',
    'timeStats',
    'notes',
  ],
  keyAttribute: 'id',
});

MergeRequest.persist = function (_mergeRequestData) {
  const mergeRequestData = _.clone(_mergeRequestData);
  if (_mergeRequestData.id) {
    mergeRequestData.id = _mergeRequestData.id.toString();
  }

  delete mergeRequestData.projectId;

  return MergeRequest.ensureById(mergeRequestData.id, mergeRequestData, { ignoreUnknownAttributes: true });
};

module.exports = MergeRequest;
