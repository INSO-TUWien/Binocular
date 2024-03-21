'use strict';

import Connection from '../Connection.ts';
import Issue, { IssueDao } from '../models/Issue';
import Commit, { CommitDao } from '../models/Commit';

interface IssueCommitConnectionDao {}

class IssueCommitConnection extends Connection<IssueCommitConnectionDao, IssueDao, CommitDao> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(Issue, Commit);
  }
}
export default new IssueCommitConnection();
