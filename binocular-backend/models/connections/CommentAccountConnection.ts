'use strict';

import Connection from '../Connection.ts';
import Account, { AccountDataType } from '../models/Account.ts';
import ReviewComment, { ReviewCommentDataType } from '../models/Comment.ts';

export interface CommentAccountConnectionDataType {
  role: string;
}

class CommentAccountConnection extends Connection<CommentAccountConnectionDataType, ReviewCommentDataType, AccountDataType> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(ReviewComment, Account);
  }
}
export default new CommentAccountConnection();
