'use strict';

import Connection from './Connection';
import Issue, { IssueDao } from './Issue';
import Commit, { CommitDao } from './Commit';

interface IssueCommitConnectionDao {}

class IssueCommitConnection extends Connection<IssueCommitConnectionDao, IssueDao, CommitDao> {
  constructor() {
    super(Issue, Commit);
  }
}
export default new IssueCommitConnection();
