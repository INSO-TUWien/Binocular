'use strict';

import Connection from '../Connection';
import CommitFile, { CommitFileConnectionDao } from './CommitFileConnection';
import Stakeholder, { StakeholderDao } from '../models/Stakeholder';
import OwnershipHunk from '../../types/supportingTypes/OwnershipHunk';

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
