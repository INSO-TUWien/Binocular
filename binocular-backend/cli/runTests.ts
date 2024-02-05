import Mocha from 'mocha';
import chalk from 'chalk';
import fs from 'fs';
import logSymbols from 'log-symbols';
import { table } from 'table';

export function runTests(options: { frontend: string; backend: string }) {
  const mocha = new Mocha();
  if (options.backend === 'true') {
    const testFiles = fs.readdirSync(__dirname + '/../../binocular-backend/test/');
    for (const testFile of testFiles) {
      if (testFile.endsWith('.js')) {
        mocha.addFile(__dirname + '/../../binocular-backend/test/' + testFile);
      }
    }
  }
  if (options.frontend === 'true') {
    const testFiles = fs.readdirSync(__dirname + '/../../binocular-frontend/test/');
    for (const testFile of testFiles) {
      if (testFile.endsWith('.js')) {
        mocha.addFile(__dirname + '/../../binocular-frontend/test/' + testFile);
      }
    }
  }
  let testsStartedBackend: number = 0;
  let testsDoneBackend: number = 0;
  let testsPassedBackend: number = 0;
  let testsFailedBackend: number = 0;

  let testsStartedFrontend: number = 0;
  let testsDoneFrontend: number = 0;
  let testsPassedFrontend: number = 0;
  let testsFailedFrontend: number = 0;

  mocha
    .run()
    .on('test', function (test) {
      if (test.file !== undefined) {
        if (test.file.includes('binocular-backend')) {
          testsStartedBackend++;
        } else if (test.file.includes('binocular-frontend')) {
          testsStartedFrontend++;
        }
        console.log(logSymbols.info, chalk.blue('Test started: ' + test.title));
      }
    })
    .on('test end', function (test) {
      if (test.file !== undefined) {
        if (test.file.includes('binocular-backend')) {
          testsDoneBackend++;
        } else if (test.file.includes('binocular-frontend')) {
          testsDoneFrontend++;
        }
        console.log(logSymbols.info, chalk.blue('Test done: ' + test.title));
      }
    })
    .on('pass', function (test) {
      if (test.file !== undefined) {
        if (test.file.includes('binocular-backend')) {
          testsPassedBackend++;
        } else if (test.file.includes('binocular-frontend')) {
          testsPassedFrontend++;
        }
        console.log(logSymbols.success, chalk.greenBright('Test passed'));
        //console.log(test);
      }
    })
    .on('fail', function (test, err) {
      if (test.file !== undefined) {
        if (test.file.includes('binocular-backend')) {
          testsFailedBackend++;
        } else if (test.file.includes('binocular-frontend')) {
          testsFailedFrontend++;
        }
        console.log(logSymbols.error, chalk.red('Test fail'));
        //console.log(test);
        console.log(err);
      }
    })
    .on('end', function () {
      const testsDone = testsDoneBackend + testsDoneFrontend;
      const testsPassed = testsPassedBackend + testsPassedFrontend;
      if (testsPassed === testsDone) {
        console.log(logSymbols.success, chalk.greenBright.bold.underline(' (' + testsPassed + '/' + testsDone + ')'));
      } else {
        console.log(logSymbols.error, chalk.redBright.bold.underline('(' + testsPassed + '/' + testsDone + ')'));
      }
      const data = [
        [
          chalk.bgBlueBright.whiteBright('Tests Started'),
          chalk.bgBlueBright.whiteBright('Tests Done'),
          chalk.bgGreenBright.whiteBright('Tests Passed'),
          chalk.bgRedBright.whiteBright('Tests Failed'),
        ],
        [
          chalk.underline.bold(
            'Backend Tests' + (options.backend === 'true' ? '' : chalk.blue(' (' + logSymbols.info + ':Tests not executed)')),
          ),
          '',
          '',
          '',
        ],
        [chalk.blue(testsStartedBackend), chalk.blue(testsDoneBackend), chalk.green(testsPassedBackend), chalk.red(testsFailedBackend)],
        [
          chalk.underline.bold(
            'Frontend Tests' + (options.frontend === 'true' ? '' : chalk.blue(' (' + logSymbols.info + ':Tests not executed)')),
          ),
          '',
          '',
          '',
        ],
        [chalk.blue(testsStartedFrontend), chalk.blue(testsDoneFrontend), chalk.green(testsPassedFrontend), chalk.red(testsFailedFrontend)],
        [chalk.underline.bold('Sum'), '', '', ''],
        [
          chalk.blue(testsStartedBackend + testsStartedFrontend),
          chalk.blue(testsDoneBackend + testsDoneFrontend),
          chalk.green(testsPassedBackend + testsPassedFrontend),
          chalk.red(testsFailedBackend + testsFailedFrontend),
        ],
      ];

      console.log(
        table(data, {
          columnDefault: {
            width: 15,
          },
          border: {
            topBody: '─',
            topJoin: '┬',
            topLeft: '┌',
            topRight: '┐',

            bottomBody: '─',
            bottomJoin: '┴',
            bottomLeft: '└',
            bottomRight: '┘',

            bodyLeft: '│',
            bodyRight: '│',
            bodyJoin: '│',

            joinBody: '─',
            joinLeft: '├',
            joinRight: '┤',
            joinJoin: '┼',
          },
          columns: [{ alignment: 'center' }, { alignment: 'center' }, { alignment: 'center' }, { alignment: 'center' }],
          spanningCells: [
            { col: 0, row: 1, colSpan: 4 },
            { col: 0, row: 3, colSpan: 4 },
            { col: 0, row: 5, colSpan: 4 },
          ],
        }),
      );

      process.exit();
    });
}
