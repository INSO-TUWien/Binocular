'use strict';

import Connection from './Connection.js';
import CommitFile from './CommitFileConnection.js';
import Stakeholder from './Stakeholder.js';

export default new Connection(CommitFile, Stakeholder);
