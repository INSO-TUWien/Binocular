'use strict';

import fs from 'fs';
import * as utils from './utils';
import console_stamp from 'console-stamp';
import path from 'path';
import { fileURLToPath } from 'url';
import Context from './context';
import Db from '../core/db/db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console_stamp(console, { format: ':date(yyyy/mm/dd HH:MM:ss)' });

export function checkProjectStructureAndFix(context: typeof Context) {
  //check if db_export folder exists
  if (context.argv.export && !fs.existsSync(__dirname + '/../../binocular-frontend/db_export')) {
    this.createAndFillDbExportFolder(context.db, __dirname + '/../../binocular-frontend');
  }
}

export function createAndFillDbExportFolder(db: Db, targetPath: string) {
  fs.mkdirSync(targetPath + '/db_export');
  utils.getDbExport(db).then((db) => {
    let i = 0;
    for (const collection of Object.keys(db)) {
      fs.writeFileSync(targetPath + '/db_export/' + collection.replaceAll('_', '-') + '.json', JSON.stringify(db[collection]));
      i++;
      console.log('Create Db export for offline execution: ' + Math.floor((100 / Object.keys(db).length) * i) + '%');
    }
  });
}

export function writeContextToFrontend(context: typeof Context) {
  async function getData(context: typeof Context) {
    const data: any = {};
    data.repo = { name: await context.repo.getName() };
    return data;
  }

  getData(context).then((data) => {
    fs.writeFileSync(__dirname + '/../../binocular-frontend/config/context.json', JSON.stringify(data));
  });
}

export function deleteDbExport(targetPath: string) {
  fs.rmSync(targetPath + '/db_export', { recursive: true, force: true });
}
