'use strict';

import Model from './Model.js';

const Stakeholder = new Model('Stakeholder', {
  attributes: ['gitSignature', 'gitlabId', 'gitlabName', 'gitlabAvatarUrl', 'gitlabWebUrl'],
});

export default Stakeholder;
