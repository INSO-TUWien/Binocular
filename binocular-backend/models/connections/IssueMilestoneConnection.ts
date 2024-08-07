import Connection from '../Connection.ts';
import Issue, { IssueDataType } from '../models/Issue.ts';
import Milestone, { MilestoneDataType } from '../models/Milestone.ts';

interface IssueMilestoneConnectionDataType {}

class IssueMilestoneConnection extends Connection<IssueMilestoneConnectionDataType, IssueDataType, MilestoneDataType> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(Issue, Milestone);
  }
}

export default new IssueMilestoneConnection();
