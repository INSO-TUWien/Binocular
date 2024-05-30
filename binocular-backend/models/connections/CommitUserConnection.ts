'use strict';

import Connection from '../Connection.ts';
import Commit, { CommitDataType } from '../models/Commit';
import User, { UserDataType } from '../models/User';

export interface CommitUserConnectionDataType {}

class CommitUserConnection extends Connection<CommitUserConnectionDataType, CommitDataType, UserDataType> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(Commit, User);
  }
}
export default new CommitUserConnection();
