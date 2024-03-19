'use strict';

import _ from 'lodash';
import Model from './Model';

class Milestone extends Model {
  constructor() {
    super('Milestone', {
      attributes: ['id', 'iid', 'title', 'description', 'dueDate', 'startDate', 'state', 'createdAt', 'updatedAt', 'expired', 'webURL'],
      keyAttribute: 'id',
    });
  }

  persist(_milestoneData: any) {
    const milestoneData = _.clone(_milestoneData);
    if (milestoneData.id) {
      milestoneData.id = milestoneData.id.toString();
    }

    delete milestoneData.projectId;

    return this.ensureById(milestoneData.id, milestoneData, { ignoreUnknownAttributes: true });
  }
}

export default new Milestone();
