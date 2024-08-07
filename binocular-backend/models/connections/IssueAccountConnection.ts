'use strict';

import Connection from '../Connection.ts';
import Issue, { IssueDataType } from '../models/Issue.ts';
import Account, { AccountDataType } from '../models/Account.ts';

export interface IssueAccountConnectionDataType {
  role: string;
}

class IssueAccountConnection extends Connection<IssueAccountConnectionDataType, IssueDataType, AccountDataType> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(Issue, Account);
  }
}
export default new IssueAccountConnection();
