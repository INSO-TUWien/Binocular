'use strict';

import _ from 'lodash';
import Model from './Model';
import { aql } from 'arangojs/aql';

class ReviewComment extends Model {
  constructor() {
    super('Comment', {
      attributes: ['id', 'path', 'createdAt', 'updatedAt', 'bodyText', 'author', 'reviewThread', 'mergeRequest'],
      keyAttribute: 'id',
    });
  }

  persist(_commentData: any) {
    const commentData = _.clone(_commentData);
    if (_commentData.id) {
      commentData.id = _commentData.id.toString();
    }

    return this.ensureById(commentData.id, commentData, {
      ignoreUnknownAttributes: true,
    });
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
