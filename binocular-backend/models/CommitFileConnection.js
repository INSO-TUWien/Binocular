'use strict';

import Connection from './Connection';
import Commit from './Commit.js';
import File from './File.js';

export default new Connection(Commit, File, { attributes: ['action', 'stats', 'hunks', 'lineCount'] });
