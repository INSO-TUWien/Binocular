'use strict';

import Connection from './Connection';
import Commit, { CommitDao } from './Commit';
import Module, { ModuleDao } from './Module';
import StatsDao from './supportingTypes/StatsDao';

interface CommitModuleConnectionDao {
  stats: StatsDao;
  webUrl: string;
}

class CommitModuleConnection extends Connection<CommitModuleConnectionDao, CommitDao, ModuleDao> {
  constructor() {
    super(Commit, Module);
  }
}
export default new CommitModuleConnection();
