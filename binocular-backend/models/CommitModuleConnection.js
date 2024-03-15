'use strict';

import Connection from './Connection';
import Commit from './Commit.js';
import Module from './Module.js';

export default new Connection(Commit, Module);
