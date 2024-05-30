'use strict';

import Connection from '../Connection';
import Issue, { IssueDataType } from '../models/Issue';
import User, { UserDataType } from '../models/User';

interface IssueUserConnectionDataType {}

class IssueUserConnection extends Connection<IssueUserConnectionDataType, IssueDataType, UserDataType> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(Issue, User);
  }
}
export default new IssueUserConnection();
