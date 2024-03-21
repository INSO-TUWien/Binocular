'use strict';

import _ from 'lodash';
import Model from '../Model.ts';
import LabelDao from '../supportingTypes/LabelDao.ts';
import UserDao from '../supportingTypes/UserDao.ts';
import MentionsDao from '../supportingTypes/MentionsDao.ts';

interface MergeRequestDao {
  id: string;
  iid: number;
  title: string;
  description: string;
  createdAt: string;
  closedAt: string;
  updatedAt: string;
  labels: LabelDao[];
  milestone: any; //TODO: Add type for milestone
  state: string;
  url: string;
  webUrl: string;
  author: UserDao;
  assignee: UserDao;
  assignees: UserDao[];
  mentions: MentionsDao[];
}

class MergeRequest extends Model<MergeRequestDao> {
  constructor() {
    super({
      name: 'MergeRequest',
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
