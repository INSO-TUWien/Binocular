'use strict';

import _ from 'lodash';
import Model from '../Model';

export interface ReviewThreadDataType {
  id: string;
  path: string;
  isResolved: boolean;
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
}

export default new ReviewThread();
