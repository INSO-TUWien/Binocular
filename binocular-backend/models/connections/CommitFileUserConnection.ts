'use strict';

import Connection from '../Connection';
import CommitFile, { CommitFileConnectionDataType } from './CommitFileConnection';
import User, { UserDataType } from '../models/User';
import OwnershipHunk from '../../types/supportingTypes/OwnershipHunk';

interface CommitFileUserConnectionDataType {
  hunks: OwnershipHunk[];
}

class CommitFileUserConnection extends Connection<CommitFileUserConnectionDataType, CommitFileConnectionDataType, UserDataType> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(CommitFile, User);
  }
}
export default new CommitFileUserConnection();
