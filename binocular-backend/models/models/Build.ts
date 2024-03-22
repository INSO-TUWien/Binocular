'use strict';

import _ from 'lodash';
import Model from '../Model.ts';
import { aql } from 'arangojs';
import Job from '../../types/supportingTypes/Job';
import BuildDto from '../../types/dtos/BuildDto';

export interface BuildDao {
  id: string;
  user: string;
  userFullName: string;
  committedAt: string;
  createdAt: string;
  startedAt: string;
  updatedAt: string;
  webUrl: string;
  tag: string;
  status: string;
  duration: number;
  sha: string;
  jobs: Job[];
}

class Build extends Model<BuildDao> {
  constructor() {
    super({
      name: 'Build',
      keyAttribute: 'id',
    });
  }
  persist(_buildData: BuildDto) {
    const buildData = _.clone(_buildData);
    if (_buildData.id) {
      buildData.id = _buildData.id.toString();
    }

    return this.ensureById(buildData.id, buildData, {});
  }

  deleteShaRefAttributes() {
    if (this.rawDb === undefined) {
      throw Error('Database undefined!');
    }
    return this.rawDb.query(
      aql`
    FOR b IN builds
    REPLACE b WITH UNSET(b, "sha", "ref") IN builds`,
    );
  }
}

export default new Build();
