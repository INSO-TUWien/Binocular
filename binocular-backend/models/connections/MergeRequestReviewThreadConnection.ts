'use strict';

import Connection from '../Connection';
import MergeRequest, { MergeRequestDataType } from '../models/MergeRequest';
import ReviewThread, { ReviewThreadDataType } from '../models/ReviewThread';

export interface MergeRequestReviewThreadConnectionDataType {}

class MergeRequestReviewThreadConnection extends Connection<
  MergeRequestReviewThreadConnectionDataType,
  MergeRequestDataType,
  ReviewThreadDataType
> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(MergeRequest, ReviewThread);
  }
}
export default new MergeRequestReviewThreadConnection();
