'use strict';

import Connection from '../Connection.ts';
import MergeRequest, { MergeRequestDataType } from '../models/MergeRequest.ts';
import Commit, { CommitDataType } from '../models/Commit.ts';

interface MergeRequestCommitConnectionDataType {}

class MergeRequestCommitConnection extends Connection<MergeRequestCommitConnectionDataType, MergeRequestDataType, CommitDataType> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(MergeRequest, Commit);
  }
}
export default new MergeRequestCommitConnection();
