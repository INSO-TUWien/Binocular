'use strict';

import Connection from '../Connection.ts';
import Commit, { CommitDataType } from '../models/Commit';
import Build, { BuildDataType } from '../models/Build';

interface CommitBuildConnectionDataType {}

class CommitBuildConnection extends Connection<CommitBuildConnectionDataType, CommitDataType, BuildDataType> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(Commit, Build);
  }
}

export default new CommitBuildConnection();
