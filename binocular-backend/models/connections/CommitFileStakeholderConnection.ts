'use strict';

import Connection from '../Connection.ts';
import CommitFile, { CommitFileConnectionDao } from './CommitFileConnection.ts';
import Stakeholder, { StakeholderDao } from '../models/Stakeholder.ts';
import OwnershipHunkDao from '../supportingTypes/OwnershipHunkDao.ts';

interface CommitFileStakeholderConnectionDao {
  hunks: OwnershipHunkDao[];
}

class CommitFileStakeholderConnection extends Connection<CommitFileStakeholderConnectionDao, CommitFileConnectionDao, StakeholderDao> {
  constructor() {
    super(CommitFile, Stakeholder);
  }
}
export default new CommitFileStakeholderConnection();
