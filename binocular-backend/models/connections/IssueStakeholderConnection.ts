'use strict';

import Connection from '../Connection';
import Issue, { IssueDataType } from '../models/Issue';
import Stakeholder, { StakeholderDataType } from '../models/Stakeholder';

interface IssueStakeholderConnectionDataType {}

class IssueStakeholderConnection extends Connection<IssueStakeholderConnectionDataType, IssueDataType, StakeholderDataType> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(Issue, Stakeholder);
  }
}
export default new IssueStakeholderConnection();
