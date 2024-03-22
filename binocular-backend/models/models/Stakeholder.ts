'use strict';

import Model from '../Model';

export interface StakeholderDataType {
  gitSignature: string;
}

class Stakeholder extends Model<StakeholderDataType> {
  constructor() {
    super({
      name: 'Stakeholder',
    });
  }
}

export default new Stakeholder();
