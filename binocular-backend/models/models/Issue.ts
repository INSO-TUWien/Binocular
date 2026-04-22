'use strict';

import _ from 'lodash';
import { aql } from 'arangojs';
import Model from '../Model';
import Mention from '../../types/supportingTypes/Mention';
import IssueDto from '../../types/dtos/IssueDto';

export interface IssueDataType {
  id: string;
  iid: number;
  title: string;
  description: string;
  createdAt: string;
  closedAt: string;
  updatedAt: string;
  labels: string[];
  state: string;
  webUrl: string;
  mentions: Mention[];
}

class Issue extends Model<IssueDataType> {
  constructor() {
    super({
      name: 'Issue',
      keyAttribute: 'id',
    });
  }

  persist(_issueData: IssueDto) {
    const issueData = _.clone(_issueData);
    if (_issueData.id) {
      issueData.id = _issueData.id.toString();
    }

    delete issueData.projectId;
    delete issueData.timeStats;

    return this.ensureByExample({ id: issueData.id }, issueData, {});
  }

  deleteMentionsAttribute() {
    if (this.rawDb === undefined) {
      throw Error('Database undefined!');
    }
    return this.rawDb.query(
      aql`
    FOR i IN issues
    REPLACE i WITH UNSET(i, "mentions") IN issues`,
    );
  }
}

export default new Issue();
