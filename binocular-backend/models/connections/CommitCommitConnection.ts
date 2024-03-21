'use strict';

import Connection from '../Connection.ts';
import Commit, { CommitDao } from '../models/Commit.ts';

export interface CommitCommitConnectionDao {}

class CommitCommitConnection extends Connection<CommitCommitConnectionDao, CommitDao, CommitDao> {
  constructor() {
    super(Commit, Commit);
  }
}
export default new CommitCommitConnection();
