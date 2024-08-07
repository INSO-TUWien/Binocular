import Connection from '../Connection.ts';
import MergeRequest, { MergeRequestDataType } from '../models/MergeRequest.ts';
import Milestone, { MilestoneDataType } from '../models/Milestone.ts';

interface MergeRequestMilestoneConnectionDataType {}

class MergeRequestMilestoneConnection extends Connection<MergeRequestMilestoneConnectionDataType, MergeRequestDataType, MilestoneDataType> {
  constructor() {
    super();
  }

  ensureCollection() {
    return super.ensureCollection(MergeRequest, Milestone);
  }
}

export default new MergeRequestMilestoneConnection();
