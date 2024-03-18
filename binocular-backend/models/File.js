'use strict';

import { aql } from 'arangojs';
import Model from './Model';
import path from 'path';
class File extends Model {
  constructor() {
    super('File', { attributes: ['path', 'webUrl'] });
  }
  async deduceMaxLengths() {
    const Hunk = (await import('./Hunk.js')).default;
    return Promise.resolve(
      this.rawDb.query(
        aql`
      FOR file in ${this.collection}
      UPDATE file WITH {
        maxLength: MAX(
          FOR commit, edge
          IN OUTBOUND file ${Hunk.collection}
          RETURN edge.lineCount
        )
      } IN ${this.collection}
      `,
      ),
    );
  }

  dir(fileDAO) {
    const directory = path.dirname(fileDAO.path);
    return directory.startsWith('.') ? directory : `./${directory}`;
  }

  /**
   * all directories are normalised to posix path delimiter and creates an array of all subdirectories
   *
   * @returns {*[]}
   */
  getModules(fileDAO) {
    return this.dir(fileDAO)
      .split('/')
      .reduce((dirs, dir, index) => dirs.concat(index ? `${dirs[index - 1]}/${dir}` : dir), []);
  }
}

export default new File();
