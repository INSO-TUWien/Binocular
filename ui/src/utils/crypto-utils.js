'use strict';

const crypto = require('crypto');

const token = 'Binocular';

export const hash = value => crypto.createHmac('sha256', token).update(JSON.stringify(value)).digest('hex');
