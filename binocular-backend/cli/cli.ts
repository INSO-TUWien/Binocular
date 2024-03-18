import chalk from 'chalk';
import figlet from 'figlet';
import { Argument, Command, Option } from 'commander';
import path from 'path';
import * as setup from './setup.js';
import { exportDB } from './exportDB';
import { runTests } from './runTests.ts';

import package_json from '../package.json';

const cli = new Command();

function parse(
  run: (
    targetPath: string,
    options: {
      backend: boolean;
      frontend: boolean;
      open: boolean;
      clean: boolean;
      its: boolean;
      ci: boolean;
      export: boolean;
      server: boolean;
    },
  ) => void,
  build: (options: { runIndexer: boolean; buildMode: string }) => void,
) {
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
        'Binocular then hosts interactive visualizations about the gathered data via a web-interface.',
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
    .addOption(new Option('--no-backend', 'disable the backend').default(true))
    .addOption(new Option('--no-frontend', 'disable the frontend').default(true))
    .addOption(new Option('--open', 'automatic open frontend on launch').default(false))
    .addOption(new Option('--clean', 'clear db before execution').default(false))
    .addOption(new Option('--no-vcs', 'disable Version Control System indexing').default(true))
    .addOption(new Option('--no-its', 'disable Issue Tracking System indexing').default(true))
    .addOption(new Option('--no-ci', 'disable Continuous Integration indexing').default(true))
    .addOption(new Option('--export', 'export the db to the default folder of binocular').default(false))
    .addOption(new Option('--no-server', 'disable the backed webserver (when used binocular quits after indexing)').default(true))
    .action((targetPath, options) => {
      run(path.resolve(targetPath ? targetPath : '.'), options);
    });

  cli
    .command('build')
    .description('build the fronted of binocular')
    .addOption(new Option('-i, --run-indexer [repo]', 'run the indexer and db export before building the backend'))
    .addOption(new Option('-m, --build-mode <mode>', 'define the build mode').choices(['dev', 'prod', 'offline']).default('offline'))
    .action((options) => {
      build(options);
    });

  cli
    .command('export')
    .addArgument(new Argument('[targetPath]', 'relative path to where the export should be saved'))
    .description('export the database of binocular')
    .addOption(new Option('-db, --database <repo>', 'export specific database'))
    .action((targetPath, options) => {
      exportDB(targetPath, options);
    });

  cli
    .command('test')
    .description('run the test cases for binocular')
    .addOption(new Option('-f, --frontend [value]', 'specify if the frontend tests should be executed').default('true'))
    .addOption(new Option('-b, --backend [value]', 'specify if the backend tests should be executed').default('true'))
    .action((options) => {
      runTests(options);
    });

  cli.parse();
}

export default { parse };
