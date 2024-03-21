'use strict';

import Connection from '../Connection.ts';
import Commit, { CommitDao } from '../models/Commit';
import File, { FileDao } from '../models/File';
import Stats from '../../types/supportingTypes/Stats';
import ChangeHunk from '../../types/supportingTypes/ChangeHunk';

export interface CommitFileConnectionDao {
  action: string;
  lineCount: number;
  hunks: ChangeHunk[];
  stats: Stats;
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
