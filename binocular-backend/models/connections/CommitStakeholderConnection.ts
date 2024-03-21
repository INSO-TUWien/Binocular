'use strict';

import Connection from '../Connection.ts';
import Commit, { CommitDao } from '../models/Commit.ts';
import Stakeholder, { StakeholderDao } from '../models/Stakeholder.ts';

export interface CommitStakeholderConnectionDao {}

class CommitStakeholderConnection extends Connection<CommitStakeholderConnectionDao, CommitDao, StakeholderDao> {
  constructor() {
    super(Commit, Stakeholder);
  }
}
export default new CommitStakeholderConnection();
