'use strict';

import Connection from '../Connection.ts';
import Commit, { CommitDao } from '../models/Commit';
import Module, { ModuleDao } from '../models/Module';
import StatsDao from '../supportingTypes/StatsDao';

interface CommitModuleConnectionDao {
  stats: StatsDao;
  webUrl: string;
}

class CommitModuleConnection extends Connection<CommitModuleConnectionDao, CommitDao, ModuleDao> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(Commit, Module);
  }
}
export default new CommitModuleConnection();
