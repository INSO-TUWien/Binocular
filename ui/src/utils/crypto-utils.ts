'use strict';

import crypto from 'crypto';

const token = 'Binocular';

export const hash = (value: any) => crypto.createHmac('sha256', token).update(JSON.stringify(value)).digest('hex');
