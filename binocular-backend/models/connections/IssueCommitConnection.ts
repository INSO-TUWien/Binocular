'use strict';

import Connection from '../Connection.ts';
import Issue, { IssueDao } from '../models/Issue.ts';
import Commit, { CommitDao } from '../models/Commit.ts';

interface IssueCommitConnectionDao {}

class IssueCommitConnection extends Connection<IssueCommitConnectionDao, IssueDao, CommitDao> {
  constructor() {
    super(Issue, Commit);
  }
}
export default new IssueCommitConnection();
