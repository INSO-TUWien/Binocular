const inquirer = require('inquirer');
const fs = require('fs-extra');

function promptUserAndSaveConfig() {
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
        validate: (input) => {
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
    .then((answers) => {
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
    });
}

module.exports = {
  promptUserAndSaveConfig: promptUserAndSaveConfig,
};
