'use strict';

import Model from './Model';

class Stakeholder extends Model {
  constructor() {
    super('Stakeholder', {
      attributes: ['gitSignature', 'gitlabId', 'gitlabName', 'gitlabAvatarUrl', 'gitlabWebUrl'],
    });
  }
}

export default new Stakeholder();
