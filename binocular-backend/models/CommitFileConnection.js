'use strict';

import Connection from './Connection.js';
import Commit from './Commit.js';
import File from './File.js';

export default Connection.define(Commit, File, ['action', 'stats', 'hunks', 'lineCount']);
