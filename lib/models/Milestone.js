'use strict';

import _ from 'lodash';
import Model from './Model.js';

const Milestone = Model.define('Milestone', {
  attributes: ['id', 'iid', 'title', 'description', 'dueDate', 'startDate', 'state', 'createdAt', 'updatedAt', 'expired', 'webURL'],
  keyAttribute: 'id',
});

Milestone.persist = function (_milestoneData) {
  const milestoneData = _.clone(_milestoneData);
  if (milestoneData.id) {
    milestoneData.id = milestoneData.id.toString();
  }

  delete milestoneData.projectId;

  return Milestone.ensureById(milestoneData.id, milestoneData, { ignoreUnknownAttributes: true });
};

export default Milestone;
