'use strict';

import _ from 'lodash';
import Model from './Model';

class MergeRequest extends Model {
  constructor() {
    super('MergeRequest', {
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
  }
  persist(_mergeRequestData: any) {
    const mergeRequestData = _.clone(_mergeRequestData);
    if (_mergeRequestData.id) {
      mergeRequestData.id = _mergeRequestData.id.toString();
    }

    delete mergeRequestData.projectId;

    return this.ensureById(mergeRequestData.id, mergeRequestData, { ignoreUnknownAttributes: true });
  }
}

export default new MergeRequest();
