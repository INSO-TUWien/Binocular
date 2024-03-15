'use strict';

import Connection from './Connection';
import BlameHunk from './BlameHunk.js';
import Stakeholder from './Stakeholder.js';

const BlameHunkStakeholderConnection = new Connection(BlameHunk, Stakeholder);

module.exports = BlameHunkStakeholderConnection;
