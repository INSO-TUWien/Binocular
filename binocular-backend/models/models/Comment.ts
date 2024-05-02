'use strict';

import _ from 'lodash';
import Model from '../Model';
import { aql } from 'arangojs/aql';
import { ReviewThreadDataType } from './ReviewThread';
import { MergeRequestDataType } from './MergeRequest';

export interface ReviewCommentDataType {
  id: string;
  path: string;
  createdAt: string;
  updatedAt: string;
  bodyText: string;
  author: string;
  reviewThread: ReviewThreadDataType;
  mergeRequest: MergeRequestDataType;
}

class ReviewComment extends Model<ReviewCommentDataType> {
  constructor() {
    super({
      name: 'Comment',
      keyAttribute: 'id',
    });
  }

  persist(_commentData: any) {
    const commentData = _.clone(_commentData);
    if (_commentData.id) {
      commentData.id = _commentData.id.toString();
    }

    return this.ensureById(commentData.id, commentData, {});
  }

  deleteMergeRequestRefAttribute() {
    if (this.rawDb === undefined) {
      throw Error('Database undefined!');
    }
    return this.rawDb.query(
      aql`
    FOR c IN comments
    REPLACE c WITH UNSET(c, "mergeRequest") IN comments`,
    );
  }

  deleteReviewThreadRefAttribute() {
    if (this.rawDb === undefined) {
      throw Error('Database undefined!');
    }
    return this.rawDb.query(
      aql`
    FOR c IN comments
    REPLACE c WITH UNSET(c, "reviewThread") IN comments`,
    );
  }
}

export default new ReviewComment();
