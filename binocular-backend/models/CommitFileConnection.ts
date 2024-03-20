'use strict';

import Connection from './Connection';
import Commit, { CommitDao } from './Commit';
import File, { FileDao } from './File';
import StatsDao from './supportingTypes/StatsDao';
import HunkDao from './supportingTypes/HunkDao';

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
