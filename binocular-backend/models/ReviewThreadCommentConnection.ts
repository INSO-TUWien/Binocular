'use strict';

import Connection from './Connection';
import ReviewThread from './ReviewThread';
import ReviewComment from './Comment';

class ReviewThreadCommentConnenction extends Connection {
  constructor() {
    super(ReviewThread, ReviewComment);
  }
}
export default new ReviewThreadCommentConnenction();
