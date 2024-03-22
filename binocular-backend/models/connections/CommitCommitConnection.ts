'use strict';

import Connection from '../Connection.ts';
import Commit, { CommitDataType } from '../models/Commit';

export interface CommitCommitConnectionDataType {}

class CommitCommitConnection extends Connection<CommitCommitConnectionDataType, CommitDataType, CommitDataType> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(Commit, Commit);
  }
}
export default new CommitCommitConnection();
