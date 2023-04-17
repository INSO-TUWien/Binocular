const inquirer = require('inquirer');
const fs = require('fs-extra');

function promptUserAndSaveConfig() {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'gitlabUrl',
        message: 'Enter GitLab URL:',
      },
      {
        type: 'input',
        name: 'gitlabToken',
        message: 'Enter GitLab API Token:',
      },
      {
        type: 'input',
        name: 'githubUsername',
        message: 'Enter GitHub Username:',
      },
      {
        type: 'password',
        name: 'githubPassword',
        message: 'Enter GitHub Password:',
      },
      {
        type: 'input',
        name: 'githubToken',
        message: 'Enter GitHub API Token:',
      },
      {
        type: 'input',
        name: 'arangoHost',
        message: 'Enter Arango Host:',
      },
      {
        type: 'input',
        name: 'arangoPort',
        message: 'Enter your ArangoDB port:',
        validate: (input) => {
          const number = parseInt(input);
          return Number.isInteger(number) && number > 0 && number < 65536;
        },
      },
      {
        type: 'input',
        name: 'arangoUser',
        message: 'Enter Arango User:',
      },
      {
        type: 'password',
        name: 'arangoPassword',
        message: 'Enter Arango Password:',
      },
    ])
    .then((answers) => {
      const data = {
        gitlab: {
          url: answers.gitlabUrl,
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
