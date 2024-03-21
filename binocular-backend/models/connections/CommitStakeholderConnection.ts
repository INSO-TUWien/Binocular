'use strict';

import Connection from '../Connection.ts';
import Commit, { CommitDao } from '../models/Commit';
import Stakeholder, { StakeholderDao } from '../models/Stakeholder';

export interface CommitStakeholderConnectionDao {}

class CommitStakeholderConnection extends Connection<CommitStakeholderConnectionDao, CommitDao, StakeholderDao> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(Commit, Stakeholder);
  }
}
export default new CommitStakeholderConnection();
