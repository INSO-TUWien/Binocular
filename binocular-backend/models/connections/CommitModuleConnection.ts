'use strict';

import Connection from '../Connection.ts';
import Commit, { CommitDao } from '../models/Commit.ts';
import Module, { ModuleDao } from '../models/Module.ts';
import StatsDao from '../supportingTypes/StatsDao.ts';

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
