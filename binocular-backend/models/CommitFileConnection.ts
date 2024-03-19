'use strict';

import Connection from './Connection';
import Commit from './Commit';
import File from './File';

class CommitFileConnection extends Connection {
  constructor() {
    super(Commit, File, { attributes: ['action', 'stats', 'hunks', 'lineCount'] });
  }
}
export default new CommitFileConnection();
