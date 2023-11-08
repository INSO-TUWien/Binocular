'use strict';

import Connection from './Connection.js';
import Commit from './Commit.js';
import Module from './Module.js';

export default Connection.define(Commit, Module);
