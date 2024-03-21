'use strict';

import Connection from '../Connection.ts';
import Issue, { IssueDao } from '../models/Issue.ts';
import Stakeholder, { StakeholderDao } from '../models/Stakeholder.ts';

interface IssueStakeholderConnectionDao {}

class IssueStakeholderConnection extends Connection<IssueStakeholderConnectionDao, IssueDao, StakeholderDao> {
  constructor() {
    super(Issue, Stakeholder);
  }
}
export default new IssueStakeholderConnection();
