'use strict';

import Connection from './Connection';
import Commit, { CommitDao } from './Commit';

export interface CommitCommitConnectionDao {}

class CommitCommitConnection extends Connection<CommitCommitConnectionDao, CommitDao, CommitDao> {
  constructor() {
    super(Commit, Commit);
  }
}
export default new CommitCommitConnection();
