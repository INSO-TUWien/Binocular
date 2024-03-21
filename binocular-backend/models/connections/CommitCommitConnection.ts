'use strict';

import Connection from '../Connection.ts';
import Commit, { CommitDao } from '../models/Commit';

export interface CommitCommitConnectionDao {}

class CommitCommitConnection extends Connection<CommitCommitConnectionDao, CommitDao, CommitDao> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(Commit, Commit);
  }
}
export default new CommitCommitConnection();
