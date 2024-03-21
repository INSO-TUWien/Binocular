'use strict';

import Connection from '../Connection.ts';
import CommitFile, { CommitFileConnectionDao } from './CommitFileConnection';
import Stakeholder, { StakeholderDao } from '../models/Stakeholder';
import OwnershipHunkDao from '../supportingTypes/OwnershipHunkDao';

interface CommitFileStakeholderConnectionDao {
  hunks: OwnershipHunkDao[];
}

class CommitFileStakeholderConnection extends Connection<CommitFileStakeholderConnectionDao, CommitFileConnectionDao, StakeholderDao> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(CommitFile, Stakeholder);
  }
}
export default new CommitFileStakeholderConnection();
