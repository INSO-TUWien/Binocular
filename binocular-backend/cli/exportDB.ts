import inquirer from 'inquirer';
import chalk from 'chalk';
import path from 'path';
import * as setupDb from '../core/db/setup-db';
import DatabaseError from '../errors/DatabaseError';
import ctx from '../utils/context';
import * as projectStructureHelper from '../utils/projectStructureHelper';
import fs from 'fs';
import Db from '../core/db/db';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export async function exportDB(targetPath: string, options: any) {
  let targetPathFull = __dirname + '/../binocular-frontend';
  if (targetPath) {
    targetPathFull = path.resolve(targetPath);
  }
  let arangoHost = '127.0.0.1';
  let arangoPort = 8529;
  let arangoUser = 'root';
  let arangoPassword = '';

  if (fs.existsSync('.binocularrc')) {
    const binocularrc = JSON.parse(fs.readFileSync('.binocularrc', 'utf8'));
    arangoHost = binocularrc.arango.host;
    arangoPort = binocularrc.arango.port;
    arangoUser = binocularrc.arango.user;
    arangoPassword = binocularrc.arango.root;
  } else {
    console.log(chalk.red(chalk.underline('No binocular config file found in current folder. Please provide ArangoDB credentials.')));
    const answers: { arangoHost: string; arangoPort: number; arangoUser: string; arangoPassword: string } = await inquirer.prompt([
      {
        type: 'input',
        name: 'arangoHost',
        message: 'Enter Arango Host:',
        default: arangoHost,
      },
      {
        type: 'input',
        name: 'arangoPort',
        message: 'Enter your ArangoDB port:',
        validate: (input: string) => {
          const number = parseInt(input);
          return Number.isInteger(number) && number > 0 && number < 65536;
        },
        default: arangoPort,
      },
      {
        type: 'input',
        name: 'arangoUser',
        message: 'Enter Arango User:',
        default: arangoUser,
      },
      {
        type: 'password',
        name: 'arangoPassword',
        message: 'Enter Arango Password (default empty password):',
        default: arangoPassword,
      },
    ]);
    arangoHost = answers.arangoHost;
    arangoPort = answers.arangoPort;
    arangoUser = answers.arangoUser;
    arangoPassword = answers.arangoPassword;
  }

  const db = setupDb.default({ host: arangoHost, port: arangoPort, user: arangoUser, password: arangoPassword });

  if (options.database) {
    exportSpecificDatabase(options.database, db, targetPathFull);
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
        exportSpecificDatabase(answers.database, db, targetPathFull);
      })
      .catch((error: Error) => {
        console.log(error);
      });
  }
}

function exportSpecificDatabase(name: string, database: Db, targetPath: string) {
  console.log(chalk.blue(chalk.underline(`Export DB: ${name}`)));
  console.log(chalk.italic(`Target Path: ${targetPath}`));

  database
    .ensureDatabase(name, ctx)
    .catch((e: Error) => {
      throw new DatabaseError(e.message);
    })
    .then(async function () {
      projectStructureHelper.deleteDbExport(targetPath);
      projectStructureHelper.createAndFillDbExportFolder(database, targetPath);
    });
}
