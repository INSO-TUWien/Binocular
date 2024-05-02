'use strict';

import _ from 'lodash';
import Model from '../Model';
import { aql } from 'arangojs/aql';
import User from '../../types/supportingTypes/User';
import { ItsIssue } from '../../types/ItsTypes';

export interface ReviewThreadDataType {
  id: string;
  createdAt: string;
  updatedAt: string;
  path: string;
  isResolved: boolean;
  resolvedBy: User;
  mergeRequest: ItsIssue;
}

class ReviewThread extends Model<ReviewThreadDataType> {
  constructor() {
    super({
      name: 'ReviewThread',
      keyAttribute: 'id',
    });
  }

  persist(_reviewData: any) {
    const reviewData = _.clone(_reviewData);
    if (_reviewData.id) {
      reviewData.id = _reviewData.id.toString();
    }

    return this.ensureById(reviewData.id, reviewData, {});
  }

  deleteMergeRequestRefAttribute() {
    if (this.rawDb === undefined) {
      throw Error('Database undefined!');
    }
    return this.rawDb.query(
      aql`
    FOR r IN reviewThreads
    REPLACE r WITH UNSET(r, "mergeRequest") IN reviewThreads`,
    );
  }
}

export default new ReviewThread();
