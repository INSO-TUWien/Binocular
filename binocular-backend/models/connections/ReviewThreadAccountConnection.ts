'use strict';

import Connection from '../Connection.ts';
import Account, { AccountDataType } from '../models/Account.ts';
import ReviewThread, { ReviewThreadDataType } from '../models/ReviewThread.ts';

export interface ReviewThreadAccountConnectionDataType {
  role: string;
}

class ReviewThreadAccountConnection extends Connection<ReviewThreadAccountConnectionDataType, ReviewThreadDataType, AccountDataType> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(ReviewThread, Account);
  }
}
export default new ReviewThreadAccountConnection();
