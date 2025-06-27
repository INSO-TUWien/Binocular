'use strict';

const token = 'Binocular';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const hash = async (value: any) => {
  'use strict';

  const enc = new TextEncoder();
  const algorithm = { name: 'HMAC', hash: 'SHA-256' };

  const key = await crypto.subtle.importKey('raw', enc.encode(token), algorithm, false, ['sign', 'verify']);
  const signature = await crypto.subtle.sign(algorithm.name, key, enc.encode(value));
  const digest = btoa(String.fromCharCode(...new Uint8Array(signature)));

  return digest;
};
