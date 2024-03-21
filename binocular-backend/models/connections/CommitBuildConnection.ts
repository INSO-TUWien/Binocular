'use strict';

import Connection from '../Connection.ts';
import Commit, { CommitDao } from '../models/Commit';
import Build, { BuildDao } from '../models/Build';

interface CommitBuildConnectionDao {}

class CommitBuildConnection extends Connection<CommitBuildConnectionDao, CommitDao, BuildDao> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(Commit, Build);
  }
}

export default new CommitBuildConnection();
