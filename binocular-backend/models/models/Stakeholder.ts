'use strict';

import Model from '../Model';

export interface StakeholderDao {
  gitSignature: string;
}

class Stakeholder extends Model<StakeholderDao> {
  constructor() {
    super({
      name: 'Stakeholder',
    });
  }
}

export default new Stakeholder();
