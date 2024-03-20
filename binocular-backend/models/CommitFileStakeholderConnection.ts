'use strict';

import Connection from './Connection';
import CommitFile, { CommitFileConnectionDao } from './CommitFileConnection';
import Stakeholder, { StakeholderDao } from './Stakeholder';
import OwnershipHunkDao from './supportingTypes/OwnershipHunkDao';

interface CommitFileStakeholderConnectionDao {
  hunks: OwnershipHunkDao[];
}

class CommitFileStakeholderConnection extends Connection<CommitFileStakeholderConnectionDao, CommitFileConnectionDao, StakeholderDao> {
  constructor() {
    super(CommitFile, Stakeholder);
  }
}
export default new CommitFileStakeholderConnection();
