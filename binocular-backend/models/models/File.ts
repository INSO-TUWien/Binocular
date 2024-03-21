'use strict';

import { aql } from 'arangojs';

import Model from '../Model';
import CommitFileConnection from '../connections/CommitFileConnection';

import path from 'path';

export interface FileDao {
  path: string;
  webUrl: string;
  maxLength: number;
}

class File extends Model<FileDao> {
  constructor() {
    super({ name: 'File' });
  }
  async deduceMaxLengths() {
    if (this.rawDb === undefined) {
      throw Error('Database undefined!');
    }
    return Promise.resolve(
      this.rawDb.query(
        aql`
      FOR file in ${this.collection}
      UPDATE file WITH {
        maxLength: MAX(
          FOR commit, edge
          IN INBOUND file ${CommitFileConnection.collection}
          RETURN edge.lineCount
        )
      } IN ${this.collection}
      `,
      ),
    );
  }

  dir(file: FileDao): string {
    const directory = path.dirname(file.path);
    return directory.startsWith('.') ? directory : `./${directory}`;
  }

  /**
   * all directories are normalised to posix path delimiter and creates an array of all subdirectories
   *
   * @returns {*[]}
   */
  getModules(file: FileDao): string[] {
    return this.dir(file)
      .split('/')
      .reduce((dirs: string[], dir: string, index: number) => dirs.concat(index ? `${dirs[index - 1]}/${dir}` : dir), []);
  }
}

export default new File();
