'use strict';

import Connection from '../Connection.ts';
import Issue, { IssueDao } from '../models/Issue.ts';
import Stakeholder, { StakeholderDao } from '../models/Stakeholder';

interface IssueStakeholderConnectionDao {}

class IssueStakeholderConnection extends Connection<IssueStakeholderConnectionDao, IssueDao, StakeholderDao> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(Issue, Stakeholder);
  }
}
export default new IssueStakeholderConnection();
