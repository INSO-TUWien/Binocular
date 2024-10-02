'use strict';

import Connection from '../Connection.ts';
import Issue, { IssueDataType } from '../models/Issue';
import Commit, { CommitDataType } from '../models/Commit';

interface IssueCommitConnectionDataType {}

class IssueCommitConnection extends Connection<IssueCommitConnectionDataType, IssueDataType, CommitDataType> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(Issue, Commit);
  }
}
export default new IssueCommitConnection();
