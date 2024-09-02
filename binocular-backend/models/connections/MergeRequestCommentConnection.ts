'use strict';

import Connection from '../Connection';
import Comment, { ReviewCommentDataType } from '../models/Comment';
import MergeRequest, { MergeRequestDataType } from '../models/MergeRequest';

export interface MergeRequestCommentConnectionDataType {}

class MergeRequestCommentConnection extends Connection<MergeRequestCommentConnectionDataType, MergeRequestDataType, ReviewCommentDataType> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(MergeRequest, Comment);
  }
}
export default new MergeRequestCommentConnection();
