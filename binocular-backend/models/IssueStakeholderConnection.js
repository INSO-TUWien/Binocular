'use strict';

import Connection from './Connection';
import Issue from './Issue.js';
import Stakeholder from './Stakeholder.js';

class IssueStakeholderConnection extends Connection {
  constructor() {
    super(Issue, Stakeholder);
  }
}
export default new IssueStakeholderConnection();
