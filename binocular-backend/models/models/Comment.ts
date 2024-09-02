'use strict';

import _ from 'lodash';
import Model from '../Model';

export interface ReviewCommentDataType {
  id: string;
  path: string;
  createdAt: string;
  updatedAt: string;
  bodyText: string;
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
}

export default new ReviewComment();
