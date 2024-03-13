'use strict';

import Connection from './Connection.js';
import Commit from './Commit.js';

const CommitCommitConnection = new Connection(Commit, Commit);

export default CommitCommitConnection;
