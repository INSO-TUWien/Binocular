'use strict';

import Connection from '../Connection.ts';
import Commit, { CommitDataType } from '../models/Commit';
import File, { FileDataType } from '../models/File';
import Stats from '../../types/supportingTypes/Stats';
import ChangeHunk from '../../types/supportingTypes/ChangeHunk';

export interface CommitFileConnectionDataType {
  action: string;
  lineCount: number;
  hunks: ChangeHunk[];
  stats: Stats;
}

class CommitFileConnection extends Connection<CommitFileConnectionDataType, CommitDataType, FileDataType> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(Commit, File);
  }
}
export default new CommitFileConnection();
