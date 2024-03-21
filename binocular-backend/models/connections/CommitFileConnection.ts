'use strict';

import Connection from '../Connection.ts';
import Commit, { CommitDao } from '../models/Commit.ts';
import File, { FileDao } from '../models/File.ts';
import StatsDao from '../supportingTypes/StatsDao.ts';
import HunkDao from '../supportingTypes/HunkDao.ts';

export interface CommitFileConnectionDao {
  action: string;
  lineCount: number;
  hunks: HunkDao[];
  stats: StatsDao;
}

class CommitFileConnection extends Connection<CommitFileConnectionDao, CommitDao, FileDao> {
  constructor() {
    super(Commit, File);
  }
}
export default new CommitFileConnection();
