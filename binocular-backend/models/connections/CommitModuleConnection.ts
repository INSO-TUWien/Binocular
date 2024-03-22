'use strict';

import Connection from '../Connection';
import Commit, { CommitDataType } from '../models/Commit';
import Module, { ModuleDataType } from '../models/Module';
import Stats from '../../types/supportingTypes/Stats';

interface CommitModuleConnectionDataType {
  stats: Stats;
  webUrl: string;
}

class CommitModuleConnection extends Connection<CommitModuleConnectionDataType, CommitDataType, ModuleDataType> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(Commit, Module);
  }
}
export default new CommitModuleConnection();
