'use strict';

import Connection from '../Connection.ts';
import MergeRequest, { MergeRequestDataType } from '../models/MergeRequest.ts';
import Issue, { IssueDataType } from '../models/Issue.ts';

interface IssueMergeRequestConnectionDataType {}

class IssueMergeRequestConnection extends Connection<IssueMergeRequestConnectionDataType, IssueDataType, MergeRequestDataType> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(Issue, MergeRequest);
  }
}
export default new IssueMergeRequestConnection();
