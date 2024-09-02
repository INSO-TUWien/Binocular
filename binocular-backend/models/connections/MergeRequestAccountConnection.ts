'use strict';

import Connection from '../Connection.ts';
import MergeRequest, { MergeRequestDataType } from '../models/MergeRequest.ts';
import Account, { AccountDataType } from '../models/Account.ts';

export interface MergeRequestAccountConnectionDataType {
  role: string;
}

class MergeRequestAccountConnection extends Connection<MergeRequestAccountConnectionDataType, MergeRequestDataType, AccountDataType> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(MergeRequest, Account);
  }
}
export default new MergeRequestAccountConnection();
