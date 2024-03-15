'use strict';

import Connection from './Connection';
import Commit from './Commit.js';
import Build from './Build.js';

export default new Connection(Commit, Build);
