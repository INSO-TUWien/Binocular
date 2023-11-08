'use strict';

import Connection from './Connection.js';
import Issue from './Issue.js';
import Commit from './Commit.js';

const IssueCommitConnection = Connection.define(Issue, Commit);

export default IssueCommitConnection;
