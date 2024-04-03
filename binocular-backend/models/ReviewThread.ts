'use strict';

import _ from 'lodash';
import Model from './Model';
import { aql } from 'arangojs/aql';

class ReviewThread extends Model {
  constructor() {
    super('ReviewThread', {
      attributes: ['id', 'createdAt', 'updatedAt', 'isResolved', 'resolvedBy', 'mergeRequest'],
      keyAttribute: 'id',
    });
  }

  persist(_reviewData: any) {
    const reviewData = _.clone(_reviewData);
    if (_reviewData.id) {
      reviewData.id = _reviewData.id.toString();
    }

    return this.ensureById(reviewData.id, reviewData, {
      ignoreUnknownAttributes: true,
    });
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
