'use strict';

import Connection from './Connection';
import Commit from './Commit.js';
import Stakeholder from './Stakeholder.js';

const CommitStakeholderConnection = new Connection(Commit, Stakeholder);

export default CommitStakeholderConnection;
