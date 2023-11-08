'use strict';

import Connection from './Connection.js';
import Commit from './Commit.js';

const CommitCommitConnection = Connection.define(Commit, Commit);

export default CommitCommitConnection;
