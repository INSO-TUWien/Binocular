'use strict';

import Connection from './Connection';
import CommitFile from './CommitFileConnection.js';
import Stakeholder from './Stakeholder.js';

export default new Connection(CommitFile, Stakeholder);
