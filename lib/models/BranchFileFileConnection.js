'use strict';

import Connection from './Connection.js';
import BranchFile from './BranchFileConnection.js';
import File from './File.js';

export default Connection.define(BranchFile, File);
