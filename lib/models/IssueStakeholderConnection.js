'use strict';

import Connection from './Connection.js';
const Issue = Model.define('Issue', {
  attributes: [
    'id',
    'iid',
    'title',
    'description',
    'state',
    'url',
    'closedAt',
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
    'dueDate',
    'confidential',
    'weight',
    'webUrl',
    'subscribed',
    'mentions',
    'notes',
  ],
  keyAttribute: 'id',
});
import Stakeholder from './Stakeholder.js';
import Model from './Model.js';

const IssueStakeholderConnection = Connection.define(Issue, Stakeholder);

export default IssueStakeholderConnection;
