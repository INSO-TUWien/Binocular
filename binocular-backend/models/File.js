'use strict';

import { aql } from 'arangojs';
import Model from './Model.js';
import path from 'path';

const File = new Model('File', { attributes: ['path', 'webUrl'] });

File.deduceMaxLengths = async function () {
  const Hunk = (await import('./Hunk.js')).default;
  return Promise.resolve(
    File.rawDb.query(
      aql`
      FOR file in ${File.collection}
      UPDATE file WITH {
        maxLength: MAX(
          FOR commit, edge
          IN OUTBOUND file ${Hunk.collection}
          RETURN edge.lineCount
        )
      } IN ${File.collection}
      `,
    ),
  );
};

File.dir = function (fileDAO) {
  const directory = path.dirname(fileDAO.path);
  return directory.startsWith('.') ? directory : `./${directory}`;
};

/**
 * all directories are normalised to posix path delimiter and creates an array of all subdirectories
 *
 * @returns {*[]}
 */
File.getModules = function (fileDAO) {
  return this.dir(fileDAO)
    .split('/')
    .reduce((dirs, dir, index) => dirs.concat(index ? `${dirs[index - 1]}/${dir}` : dir), []);
};

export default File;
