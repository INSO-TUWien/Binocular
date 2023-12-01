import inquirer from 'inquirer';
import chalk from 'chalk';
import path from 'path';
import * as setupDb from '../lib/core/db/setup-db';
import DatabaseError from '../lib/errors/DatabaseError';
import ctx from '../lib/context';
import * as projectStructureHelper from '../lib/projectStructureHelper';

export async function exportDB(targetPath: string, options: any) {
  const targetPathFull = path.resolve(targetPath ?? '.');
  const arangoHost = '127.0.0.1';
  const arangoPort = 8529;
  const arangoUser = 'root';
  const arangoPassword = '';

  const db = setupDb.default({ host: arangoHost, port: arangoPort, user: arangoUser, password: arangoPassword });

  if (options.database) {
    exportSpecificDatabase(options.database, db);
  } else {
    const avaliableDatabases = await db.listDatabases();
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'database',
          message: 'Select which database you want to export?',
          choices: avaliableDatabases,
        },
      ])
      .then((answers: { database: string }) => {
        exportSpecificDatabase(answers.database, db);
      })
      .catch((error: Error) => {
        console.log(error);
      });
  }
}

function exportSpecificDatabase(name: string, database: any) {
  console.log(chalk.blue(chalk.underline(`Export DB: ${name}`)));

  database
    .ensureDatabase(name, ctx)
    .catch((e: Error) => {
      throw new DatabaseError(e.message);
    })
    .then(async function () {
      projectStructureHelper.deleteDbExport();
      projectStructureHelper.createAndFillDbExportFolder(database);
    });
}
