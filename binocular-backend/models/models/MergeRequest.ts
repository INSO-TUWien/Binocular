'use strict';

import _ from 'lodash';
import { aql } from 'arangojs';
import Model from '../Model';
import Mention from '../../types/supportingTypes/Mention';
import MergeRequestDto from '../../types/dtos/MergeRequestDto';

export interface MergeRequestDataType {
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
  commits: string[];
  closingIssues: string[];
  mergeCommitSha: string | null;
}

class MergeRequest extends Model<MergeRequestDataType> {
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

    return this.ensureByExample({ id: mergeRequestData.id }, mergeRequestData, {});
  }

  deleteMentionsAttribute() {
    if (this.rawDb === undefined) {
      throw Error('Database undefined!');
    }
    return this.rawDb.query(
      aql`
    FOR i IN mergeRequests
    REPLACE i WITH UNSET(i, "mentions") IN mergeRequests`,
    );
  }
}

export default new MergeRequest();
