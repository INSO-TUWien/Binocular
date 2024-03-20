'use strict';

import Connection from './Connection';
import Commit, { CommitDao } from './Commit';
import Stakeholder, { StakeholderDao } from './Stakeholder';

export interface CommitStakeholderConnectionDao {}

class CommitStakeholderConnection extends Connection<CommitStakeholderConnectionDao, CommitDao, StakeholderDao> {
  constructor() {
    super(Commit, Stakeholder);
  }
}
export default new CommitStakeholderConnection();
