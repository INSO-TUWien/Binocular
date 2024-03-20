'use strict';

import Connection from './Connection';
import Commit, { CommitDao } from './Commit';
import Build, { BuildDao } from './Build';

interface CommitBuildConnectionDao {}

class CommitBuildConnection extends Connection<CommitBuildConnectionDao, CommitDao, BuildDao> {
  constructor() {
    super(Commit, Build);
  }
}

export default new CommitBuildConnection();
