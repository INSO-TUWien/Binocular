'use strict';

import _ from 'lodash';
import Model from '../Model';
import Label from '../../types/supportingTypes/Label';
import User from '../../types/supportingTypes/User';
import Mention from '../../types/supportingTypes/Mention';
import MergeRequestDto from '../../types/dtos/MergeRequestDto';

interface MergeRequestDao {
  id: string;
  iid: number;
  title: string;
  description: string;
  createdAt: string;
  closedAt: string;
  updatedAt: string;
  labels: Label[];
  milestone: any; //TODO: Add type for milestone
  state: string;
  url: string;
  webUrl: string;
  author: User;
  assignee: User;
  assignees: User[];
  mentions: Mention[];
}

class MergeRequest extends Model<MergeRequestDao> {
  constructor() {
    super({
      name: 'MergeRequest',
      keyAttribute: 'id',
    });
  }
  persist(_mergeRequestData: MergeRequestDto) {
    const mergeRequestData = _.clone(_mergeRequestData);
    if (_mergeRequestData.id) {
      mergeRequestData.id = _mergeRequestData.id.toString();
    }

    delete mergeRequestData.projectId;

    return this.ensureById(mergeRequestData.id, mergeRequestData, { ignoreUnknownAttributes: true });
  }
}

export default new MergeRequest();
