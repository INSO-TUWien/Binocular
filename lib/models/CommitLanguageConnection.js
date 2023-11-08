'use strict';

import Connection from './Connection.js';
import Commit from './Commit.js';
import Language from './Language.js';

export default Connection.define(Commit, Language);
