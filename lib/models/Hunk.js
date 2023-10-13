'use strict';

import Connection from './Connection.js';
import Model from './Model.js';
const Commit = Model.define('Commit', {
  attributes: ['sha', 'message', 'signature', 'date', 'stats', 'branch', 'history', 'parents', 'webUrl'],
  keyAttribute: 'sha',
});
const File = Model.define('File', { attributes: ['path', 'webUrl'] });

const Hunk = Connection.define(Commit, File);

export default Hunk;
