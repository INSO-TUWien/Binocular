'use strict';

import Connection from '../Connection.ts';
import Commit, { CommitDao } from '../models/Commit';
import File, { FileDao } from '../models/File';
import StatsDao from '../supportingTypes/StatsDao';
import HunkDao from '../supportingTypes/HunkDao';

export interface CommitFileConnectionDao {
  action: string;
  lineCount: number;
  hunks: HunkDao[];
  stats: StatsDao;
}

class CommitFileConnection extends Connection<CommitFileConnectionDao, CommitDao, FileDao> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(Commit, File);
  }
}
export default new CommitFileConnection();
