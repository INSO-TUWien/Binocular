'use strict';

import crypto from 'crypto';

const token = 'Binocular';

export const hash = value => crypto.createHmac('sha256', token).update(value).digest('hex');
