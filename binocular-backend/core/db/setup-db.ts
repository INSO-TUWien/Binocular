'use strict';

import Db from './db.js';
export default function (arangoConfig: { host: string; port: number; user: string; password: string }) {
  return new Db(arangoConfig);
}
