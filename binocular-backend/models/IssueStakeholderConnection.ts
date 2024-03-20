'use strict';

import Connection from './Connection';
import Issue, { IssueDao } from './Issue';
import Stakeholder, { StakeholderDao } from './Stakeholder';

interface IssueStakeholderConnectionDao {}

class IssueStakeholderConnection extends Connection<IssueStakeholderConnectionDao, IssueDao, StakeholderDao> {
  constructor() {
    super(Issue, Stakeholder);
  }
}
export default new IssueStakeholderConnection();
