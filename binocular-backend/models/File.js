'use strict';

import { aql } from 'arangojs';
import Model from './Model.js';
import path from 'path';

const File = Model.define('File', { attributes: ['path', 'webUrl'] });

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

File.prototype.dir = function () {
  const directory = path.dirname(this.path);
  return directory.startsWith('.') ? directory : `./${directory}`;
};

/**
 * all directories are normalised to posix path delimiter and creates an array of all subdirectories
 *
 * @returns {*[]}
 */
File.prototype.getModules = function () {
  return this.dir()
    .split('/')
    .reduce((dirs, dir, index) => dirs.concat(index ? `${dirs[index - 1]}/${dir}` : dir), []);
};

export default File;
