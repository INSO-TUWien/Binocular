'use strict';

import Connection from '../Connection.ts';
import Commit, { CommitDao } from '../models/Commit.ts';
import Build, { BuildDao } from '../models/Build.ts';

interface CommitBuildConnectionDao {}

class CommitBuildConnection extends Connection<CommitBuildConnectionDao, CommitDao, BuildDao> {
  constructor() {
    super(Commit, Build);
  }
}

export default new CommitBuildConnection();
