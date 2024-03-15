'use strict';

import Model from './Model';

const Stakeholder = new Model('Stakeholder', {
  attributes: ['gitSignature', 'gitlabId', 'gitlabName', 'gitlabAvatarUrl', 'gitlabWebUrl'],
});

export default Stakeholder;
