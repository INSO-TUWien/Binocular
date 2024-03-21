'use strict';

import Connection from '../Connection';
import Commit, { CommitDao } from '../models/Commit';
import Module, { ModuleDao } from '../models/Module';
import Stats from '../../types/supportingTypes/Stats';

interface CommitModuleConnectionDao {
  stats: Stats;
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
