'use strict';

import _ from 'lodash';
import Model from '../Model.ts';

interface MilestoneDao {
  id: string;
  iid: number;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  startDate: string;
  dueDate: string;
  state: string;
  expired: boolean;
  webUrl: string;
}

class Milestone extends Model<MilestoneDao> {
  constructor() {
    super({
      name: 'Milestone',
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
