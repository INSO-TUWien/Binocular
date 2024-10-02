'use strict';

import Model from './Model.js';

const Stakeholder = Model.define('Stakeholder', {
  attributes: ['gitSignature', 'gitlabId', 'gitlabName', 'gitlabAvatarUrl', 'gitlabWebUrl'],
});

export default Stakeholder;
