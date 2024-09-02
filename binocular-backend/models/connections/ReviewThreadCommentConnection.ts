'use strict';

import Connection from '../Connection';
import ReviewThread, { ReviewThreadDataType } from '../models/ReviewThread';
import ReviewComment, { ReviewCommentDataType } from '../models/Comment';

export interface ReviewThreadCommentConnectionDataType {}

class ReviewThreadCommentConnenction extends Connection<
  ReviewThreadCommentConnectionDataType,
  ReviewThreadDataType,
  ReviewCommentDataType
> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(ReviewThread, ReviewComment);
  }
}
export default new ReviewThreadCommentConnenction();
