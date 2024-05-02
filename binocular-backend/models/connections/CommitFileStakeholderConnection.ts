'use strict';

import Connection from '../Connection';
import CommitFile, { CommitFileConnectionDataType } from './CommitFileConnection';
import Stakeholder, { StakeholderDataType } from '../models/Stakeholder';
import OwnershipHunk from '../../types/supportingTypes/OwnershipHunk';

interface CommitFileStakeholderConnectionDataType {
  hunks: OwnershipHunk[];
}

class CommitFileStakeholderConnection extends Connection<
  CommitFileStakeholderConnectionDataType,
  CommitFileConnectionDataType,
  StakeholderDataType
> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(CommitFile, Stakeholder);
  }
}
export default new CommitFileStakeholderConnection();
