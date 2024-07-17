'use strict';

import fs from 'fs';
import * as utils from './utils';
import path from 'path';
import { fileURLToPath } from 'url';
import Context from './context';
import Db from '../core/db/db';
import { compressJson } from '../../utils/json-utils.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      const collName = collection.replaceAll('_', '-');
      // make the json files smaller to help with offline performance
      const compressedObj = compressJson(collName, db[collection]);
      fs.writeFileSync(targetPath + '/db_export/' + collName + '.json', JSON.stringify(compressedObj));
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
