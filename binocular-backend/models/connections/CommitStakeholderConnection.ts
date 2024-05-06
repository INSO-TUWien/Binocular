'use strict';

import Connection from '../Connection.ts';
import Commit, { CommitDataType } from '../models/Commit';
import Stakeholder, { StakeholderDataType } from '../models/Stakeholder';

export interface CommitStakeholderConnectionDataType {}

class CommitStakeholderConnection extends Connection<CommitStakeholderConnectionDataType, CommitDataType, StakeholderDataType> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(Commit, Stakeholder);
  }
}
export default new CommitStakeholderConnection();
