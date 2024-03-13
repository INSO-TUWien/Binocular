'use strict';

import Connection from './Connection.js';
import Issue from './Issue.js';
import Stakeholder from './Stakeholder.js';

const IssueStakeholderConnection = new Connection(Issue, Stakeholder);

export default IssueStakeholderConnection;
