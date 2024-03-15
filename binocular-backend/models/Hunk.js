'use strict';

import Connection from './Connection';
import Commit from './Commit.js';
import File from './File.js';

const Hunk = new Connection(Commit, File);

export default Hunk;
