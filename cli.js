'use strict';

const { Command } = require('commander');
const { spawn } = require('child_process');
const figlet = require('figlet');
const chalk = require('chalk');
const package_json = require('./package.json');

const cli = new Command();

// Show help when no arguments passed
if (process.argv.length < 3) {
  cli.help();
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
      'and the GitLab REST-API and persist it to a configured ArangoDB instance.\n' +
      '\n' +
      'Binocular then hosts interactive visualizations about the gathered data via a web-interface.'
  )
  .option('-e, --export-db <repo>', 'Index the repository <repo> and export the ArangoDB database')
  .option('-o, --build-offline <repo>', 'Prepares the artifacts needed for an offline visualization of the repository <repo>')
  .option('-rf,--run-frontend', 'Starts the dev frontend application')
  .option('-rb, --run-backend <repo>', 'Starts the dev backend application for repository <repo>')
  .parse(process.argv);

console.log(chalk.green(figlet.textSync('Binocular')));

const options = cli.opts();

if (options.exportDb) {
  console.log(chalk.cyan(`Indexing repository ${options.exportDb} in offline mode and exporting the database...`));
  execute(`node binocular.js --no-open --no-server ${options.exportDb}`);
}

if (options.buildOffline) {
  console.log(chalk.cyan(`Indexing repository ${options.buildOffline} and building frontend for an offline run...`));
  execute(`node binocular.js --no-open --no-server ${options.buildOffline}`, 'npm run build');
}

if (options.runFrontend) {
  console.log(chalk.cyan('Starting the frontend application...'));
  execute('webpack serve --config webpack.dev.js');
}

if (options.runBackend) {
  console.log(chalk.cyan('Starting the backend application...'));
  execute(`npm run dev-server ${options.runBackend}`);
}

// Executes statements sequentially
function execute(...statements) {
  const chainedStatement = chainStatements(...statements);
  spawn(chainedStatement, { stdio: 'inherit', shell: true });

  // SIGINT gets sent to the entire process group, so no need to send it again to the child process
  process.on('SIGINT', () => {});

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
