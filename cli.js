#!/usr/bin/env node
'use strict';

import { Argument, Command, Option } from 'commander';
import { spawn } from 'child_process';
import figlet from 'figlet';
import chalk from 'chalk';
import * as setup from './cli/setup.js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const package_json = require('./package.json');

const cli = new Command();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(chalk.green(figlet.textSync('Binocular')));

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
  );

cli
  .command('setup')
  .description('setup the database or the config file of binocular')
  .action(() => {
    setup.setup();
  });

cli
  .command('run')
  .addArgument(new Argument('[targetPath]', 'relative path to the repository'))
  .description('execute the binocular frontend and backend')
  .addOption(new Option('--no-backend', 'disable the backend'))
  .addOption(new Option('--no-frontend', 'disable the frontend'))
  .addOption(new Option('--no-export', 'disable the default db export'))
  .addOption(new Option('--no-server', 'disable the backed webserver (when used binocular quits after indexing)'))
  .action((targetPath, options) => {
    if (options.backend && options.frontend) {
      console.log(chalk.cyan('Starting the frontend and backend application concurrently...'));
      execute(
        `concurrently --kill-others -P  "webpack serve --config webpack.dev.js" "tsx binocular.js ${path.resolve(
          targetPath ? targetPath : '.'
        )} ${options.export ? '' : '--no-export'} ${options.server ? '' : '--no-server'}" --`
      );
    } else if (options.backend && !options.frontend) {
      console.log(chalk.cyan('Starting the backend application...'));
      execute(
        `tsx binocular.js ${path.resolve(targetPath ? targetPath : '.')} ${options.export ? '' : '--no-export'} ${
          options.server ? '' : '--no-server'
        }`
      );
    } else if (!options.backend && options.frontend) {
      console.log(chalk.cyan('Starting the frontend application...'));
      execute('npm run dev-frontend');
    }
  });

cli
  .command('build')
  .description('build the fronted of binocular')
  .addOption(new Option('-i, --run-indexer [repo]', 'run the indexer and db export before building the backend'))
  .addOption(new Option('-m, --build-mode <mode>', 'define the build mode').choices(['dev', 'prod', 'offline']).default('dev'))
  .action((options) => {
    if (options.runIndexer === undefined) {
      console.log(chalk.cyan('Building frontend...'));
      execute(`npm run build:${options.buildMode}`);
    } else if (options.runIndexer === true) {
      fs.rmSync(`${__dirname}/ui/db_export`, { recursive: true, force: true });
      console.log(chalk.cyan('Indexing repository . and building frontend for an offline run...'));
      execute(`tsx binocular.js --no-open --no-server ${path.resolve('.')}`, `npm run build:${options.buildMode}`);
    } else {
      fs.rmSync(`${__dirname}/ui/db_export`, { recursive: true, force: true });
      console.log(chalk.cyan(`Indexing repository ${options.runIndexer} and building frontend for an offline run...`));
      execute(`tsx binocular.js --no-open --no-server ${path.resolve(options.runIndexer)}`, `npm run build:${options.buildMode}`);
    }
  });

cli.parse();

/*
  .addOption(new Option('-sdb, --setup-db', 'helps set up the database needed for the backend application to run'))
  .addOption(new Option('-sc, --setup-config', 'starts an interactive step-by-step wizard that configures the application'))
  .addOption(
    new Option(
      '-rc, --run-concurrently [repo]',
      'starts the dev backend and frontend application for repository [repo]. Default is current repository. ' +
        "(also exports db when --no-export flag wasn't set)"
    ).preset('.')
  )
  .addOption(
    new Option(
      '-rb, --run-backend [repo]',
      'starts the dev backend application for repository [repo]. Default is current repository. ' +
        "(also exports db when --no-export flag wasn't set)"
    ).preset('.')
  )
  .addOption(new Option('-rf,--run-frontend', 'starts the dev frontend application'))
  .addOption(
    new Option('-i, --index [repo]', "index the repository [repo]. (also exports db when --no-export flag wasn't set)").preset('.')
  )
  .addOption(
    new Option(
      '-o, --build-offline [repo]',
      'prepares the artifacts needed for an offline visualization of the repository [repo]. Default is current repository.'
    ).preset('.')
  )
  .addOption(new Option('-b, --build', 'builds the frontend application.'))
  .addOption(
    new Option('--no-export', 'disables the creation of the automatic db export.(only works when backend gets executed)').default(true)
  )

  .parse(process.argv);


const options = cli.opts();

if (options.index) {
  console.log(chalk.cyan(`Indexing repository ${options.index}`));
  fs.rmSync(`${__dirname}/ui/db_export`, { recursive: true, force: true });
  execute(`tsx binocular.js --no-open --no-server ${path.resolve(options.index)} ${options.export ? '' : '--no-export'}`);
} else if (options.buildOffline) {
  console.log(chalk.cyan(`Indexing repository ${options.buildOffline} and building frontend for an offline run...`));
  execute(`tsx binocular.js --no-open --no-server ${path.resolve(options.buildOffline)}`, 'npm run build');
} else if (options.build) {
  console.log(chalk.cyan('Building frontend...'));
  execute('npm run build');
} else if (options.runFrontend) {
  console.log(chalk.cyan('Starting the frontend application...'));
  execute('npm run dev-frontend');
} else if (options.runBackend) {
  console.log(chalk.cyan('Starting the backend application...'));
  execute(`npm run dev-server -- ${path.resolve(options.runBackend)} ${options.export ? '' : '--no-export'}`);
} else if (options.runConcurrently || !options.export) {
  console.log(chalk.cyan('Starting the frontend and backend application concurrently...'));
  execute(
    `concurrently --kill-others -P  "webpack serve --config webpack.dev.js" "npm run dev-server ${path.resolve(
      options.runConcurrently ? options.runConcurrently : '.'
    )} -- ${options.export ? '' : '--no-export'}" --`
  );
} else if (options.setupDb) {
  console.log(
    'To use binocular you need a version of ' +
      chalk.underline('ArangoDB') +
      ' running (Tested with ArangoDB 3.11). It is recommended to use the ' +
      chalk.underline('Docker Image') +
      ' provided by ArangoDB.\n'
  );
  console.log(chalk.cyan('Opening the ArangoDB download site...'));
  open('https://www.arangodb.com/download-major/');
} else if (options.setup) {
  console.log(chalk.cyan('Starting the setup-config wizard...'));
  setup.promptUserAndSaveConfig();
}*/

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
