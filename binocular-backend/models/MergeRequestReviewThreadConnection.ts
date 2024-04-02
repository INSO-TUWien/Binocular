'use strict';

import Connection from './Connection';
import MergeRequest from './MergeRequest';
import ReviewThread from './ReviewThread';

class MergeRequestReviewThreadConnection extends Connection {
  constructor() {
    super(MergeRequest, ReviewThread);
  }
}
export default new MergeRequestReviewThreadConnection();
