'use strict';

import _ from 'lodash';
import Model from '../Model';
import MilestoneDto from '../../types/dtos/MilestoneDto';

export interface MilestoneDataType {
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

class Milestone extends Model<MilestoneDataType> {
  constructor() {
    super({
      name: 'Milestone',
      keyAttribute: 'id',
    });
  }

  persist(_milestoneData: MilestoneDto) {
    const milestoneData = _.clone(_milestoneData);
    if (milestoneData.id) {
      milestoneData.id = milestoneData.id.toString();
    }

    delete milestoneData.projectId;

    return this.ensureByExample({ id: milestoneData.id }, milestoneData, {});
  }
}

export default new Milestone();
