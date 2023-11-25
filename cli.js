#!/usr/bin/env node
'use strict';

import { Command, Option } from 'commander';
import { spawn } from 'child_process';
import figlet from 'figlet';
import chalk from 'chalk';
import package_json from './package.json' assert { type: 'json' };
import open from 'open';
import * as setupConfig from './cli/setupConfig.js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const cli = new Command();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Show help when no arguments passed
if (process.argv.length < 3) {
  console.log(chalk.cyan('Starting the frontend and backend application concurrently...'));
  execute(`npm run dev-concurrently ${path.resolve('.')}`);
}

// Add unknown option handler
cli.showHelpAfterError();

// Maybe figure out how to securely load the version file from package.json
cli
  .version(package_json.version, '-v, --version')
  .description(
    'Binocular is a tool for visualizing data from various software-engineering tools.' +
      ' It works as a command-line tool run from a git-repository.' +
      ' When run, Binocular will gather data from the repository ' +
      'and the GitHub or GitLab API and persist it to a configured ArangoDB instance.\n' +
      '\n' +
      'Binocular then hosts interactive visualizations about the gathered data via a web-interface.'
  )
  .addOption(new Option('-sdb, --setup-db', 'helps set up the database needed for the backend application to run'))
  .addOption(new Option('-sc, --setup-config', 'starts an interactive step-by-step wizard that configures the application'))
  .addOption(
    new Option(
      '-rc, --run-concurrently [repo]',
      'starts the dev backend and frontend application for repository [repo]. Default is current repository.'
    ).preset('.')
  )
  .addOption(
    new Option(
      '-rb, --run-backend [repo]',
      'starts the dev backend application for repository [repo]. Default is current repository.'
    ).preset('.')
  )
  .addOption(new Option('-rf,--run-frontend', 'starts the dev frontend application'))
  .addOption(
    new Option(
      '-e, --export-db [repo]',
      'index the repository [repo] and export the ArangoDB database. Default is current repository.'
    ).preset('.')
  )
  .addOption(
    new Option(
      '-o, --build-offline [repo]',
      'prepares the artifacts needed for an offline visualization of the repository [repo]. Default is current repository.'
    ).preset('.')
  )
  .addOption(new Option('--build-offline-no-export', 'builds the frontend application.'))

  .parse(process.argv);

console.log(chalk.green(figlet.textSync('Binocular')));

const options = cli.opts();

if (options.exportDb) {
  console.log(chalk.cyan(`Indexing repository ${options.exportDb} in offline mode and exporting the database...`));
  fs.rmSync(`${__dirname}/ui/db_export`, { recursive: true, force: true });
  execute(`node binocular.js --no-open --no-server ${path.resolve(options.exportDb)}`);
}

if (options.buildOffline) {
  console.log(chalk.cyan(`Indexing repository ${options.buildOffline} and building frontend for an offline run...`));
  execute(`node binocular.js --no-open --no-server ${path.resolve(options.buildOffline)}`, 'npm run build');
}

if (options.buildOfflineNoExport) {
  console.log(chalk.cyan('Building frontend...'));
  execute('npm run build');
}

if (options.runFrontend) {
  console.log(chalk.cyan('Starting the frontend application...'));
  execute('npm run dev-frontend');
}

if (options.runBackend) {
  console.log(chalk.cyan('Starting the backend application...'));
  execute(`npm run dev-server ${path.resolve(options.runBackend)}`);
}

if (options.runConcurrently) {
  console.log(chalk.cyan('Starting the frontend and backend application concurrently...'));
  execute(`npm run dev-concurrently -- ${path.resolve(options.runConcurrently)}`);
}

if (options.setupDb) {
  console.log(
    'To use binocular you need a version of ' +
      chalk.underline('ArangoDB') +
      ' running (Tested with ArangoDB 3.11). It is recommended to use the ' +
      chalk.underline('Docker Image') +
      ' provided by ArangoDB.\n'
  );
  console.log(chalk.cyan('Opening the ArangoDB download site...'));
  open('https://www.arangodb.com/download-major/');
}

if (options.setupConfig) {
  console.log(chalk.cyan('Starting the setup-config wizard...'));
  setupConfig.promptUserAndSaveConfig();
}

// Executes statements sequentially
function execute(...statements) {
  // we are executing everything from the module folder -> paths to the repository folders need to be absolute e.G. using path.resolve
  // perhaps a less complicated alternative is possible
  statements.unshift(`cd ${__dirname}`);

  const chainedStatement = chainStatements(...statements);
  spawn(chainedStatement, { stdio: 'inherit', shell: true });

  // SIGINT gets sent to the entire process group, so no need to send it again to the child process
  process.on('SIGINT', () => {
    console.log('Event sent: SIGINT');
  });

  function chainStatements(...statements) {
    return statements.reduce((acc, statement) => {
      if (acc === '') {
        return statement;
      } else {
        return acc + ' && ' + statement;
      }
    }, '');
  }
}
