'use strict';

import Connection from '../Connection.ts';
import CommitFile, { CommitFileConnectionDao } from './CommitFileConnection';
import Stakeholder, { StakeholderDao } from '../models/Stakeholder';
import OwnershipHunk from '../supportingTypes/OwnershipHunk';

interface CommitFileStakeholderConnectionDao {
  hunks: OwnershipHunk[];
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
