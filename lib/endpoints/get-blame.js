'use strict';

const { execSync } = require('child_process');
const log = require('debug')('srv');

module.exports = function (req, res) {
  const sha = req.body.sha; // the sha from which commit the blame should be retrieved
  const files = req.body.files; //files for which git blame should be executed
  let success = true; // indicator if the commit dependencies could have been retrieved
  const result = {}; //stores the number of lines each stakeholder owns
  let output; // variable to store the output of the shell command

  for (const file of files) {
    try {
      // retrieve the owners of each line of a file using git blame
      output = execSync(`git blame -e ${sha} -- ${file}`).toString();

      // get all lines in array
      const lines = output.split('\n');

      for (const line of lines) {

        let mailTemp = line.split('<')

        if (mailTemp.length > 1) {
          mailTemp = mailTemp[1].split('>')
          if (mailTemp.length > 0) {
            const mail = mailTemp[0]

            if (result[mail]) {
              result[mail] = result[mail] + 1;
            } else {
              result[mail] = 1;
            }
          }
        }

      }
    } catch (e) {
      log('error in get-blame.js: ', e)
      success = false;
    }
  }

  res.json({
    success: success,
    blame: result
  });
};
