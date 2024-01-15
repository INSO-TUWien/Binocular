import inquirer from 'inquirer';
import fs from 'fs-extra';
import chalk from 'chalk';
import open from 'open';

export function setup() {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'setupType',
        message: 'With which setup do you need help?',
        choices: ['database', 'config'],
      },
    ])
    .then((answers: { setupType: string }) => {
      switch (answers.setupType) {
        case 'database':
          setupDb();

          break;
        case 'config':
        default:
          console.log(chalk.cyan('Starting the setup-config wizard...'));
          setupConfig();
          break;
      }
    })
    .catch((error: Error) => {
      console.log(error);
    });
}

export function setupConfig() {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'gitlabUrl',
        message: 'Enter GitLab URL [only necessary for GitLab Repositories]:',
      },
      {
        type: 'input',
        name: 'gitlabProject',
        message:
          'Enter GitLab Group and Project Name (Example Format: [Group Name]/[SubgroupName]/[ProjectName])' +
          '[only necessary for GitLab Repositories]:',
      },
      {
        type: 'input',
        name: 'gitlabToken',
        message: 'Enter GitLab API Token [only necessary for GitLab Repositories]:',
      },
      {
        type: 'input',
        name: 'githubUsername',
        message: 'Enter GitHub Username [only necessary for GitHub Repositories]:',
      },
      {
        type: 'password',
        name: 'githubPassword',
        message: 'Enter GitHub Password [only necessary for GitHub Repositories]:',
      },
      {
        type: 'input',
        name: 'githubToken',
        message: 'Enter GitHub API Token [only necessary for GitHub Repositories]:',
      },
      {
        type: 'input',
        name: 'arangoHost',
        message: 'Enter Arango Host:',
        default: '127.0.0.1',
      },
      {
        type: 'input',
        name: 'arangoPort',
        message: 'Enter your ArangoDB port:',
        validate: (input: string) => {
          const number = parseInt(input);
          return Number.isInteger(number) && number > 0 && number < 65536;
        },
        default: 8529,
      },
      {
        type: 'input',
        name: 'arangoUser',
        message: 'Enter Arango User:',
        default: 'root',
      },
      {
        type: 'password',
        name: 'arangoPassword',
        message: 'Enter Arango Password:',
      },
      {
        type: 'list',
        name: 'its',
        message: 'Select ITS (Issue Tracking System):',
        choices: ['github', 'gitlab', 'none'],
        default: 'none',
      },
      {
        type: 'list',
        name: 'ci',
        message: 'Select CI System (Continuous Integration):',
        choices: ['github', 'gitlab', 'none'],
        default: 'none',
      },
    ])
    .then(
      (answers: {
        gitlabUrl: string;
        gitlabProject: string;
        gitlabToken: string;
        githubUsername: string;
        githubPassword: string;
        githubToken: string;
        arangoHost: string;
        arangoPort: string;
        arangoUser: string;
        arangoPassword: string;
        its: string;
        ci: string;
      }) => {
        const data = {
          gitlab: {
            url: answers.gitlabUrl,
            project: answers.gitlabProject,
            token: answers.gitlabToken,
          },
          github: {
            auth: {
              type: 'token',
              username: answers.githubUsername,
              password: answers.githubPassword,
              token: answers.githubToken,
            },
          },
          arango: {
            host: answers.arangoHost,
            port: parseInt(answers.arangoPort),
            user: answers.arangoUser,
            password: answers.arangoPassword,
          },
          indexers: {},
        };

        if (answers.its !== 'none' || answers.ci !== 'none') {
          data.indexers = {
            its: answers.its === 'none' ? '' : answers.its,
            ci: answers.ci === 'none' ? '' : answers.ci,
          };
        }

        fs.writeJson('.binocularrc', data, (err) => {
          if (err) {
            console.error(err);
          } else {
            console.log('Config saved successfully!');
          }
        });
      },
    );
}

export function setupDb() {
  console.log(
    'To use binocular you need a version of ' +
      chalk.underline('ArangoDB') +
      ' running (Tested with ArangoDB 3.11). It is recommended to use the ' +
      chalk.underline('Docker Image') +
      ' provided by ArangoDB.\n',
  );
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'openArangoDownloadPage',
        message: 'Do you want to open the ArangoDB download page?',
        choices: ['Yes', 'No'],
      },
    ])
    .then((answers: { openArangoDownloadPage: string }) => {
      if (answers.openArangoDownloadPage === 'Yes') {
        console.log(chalk.cyan('Opening the ArangoDB download site...'));
        open('https://www.arangodb.com/download-major/');
      }
    })
    .catch((error: Error) => {
      console.log(error);
    });
}
