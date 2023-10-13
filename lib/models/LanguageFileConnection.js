'use strict';

import Connection from './Connection.js';
import Language from './Language.js';
import Model from './Model.js';
const File = Model.define('File', { attributes: ['path', 'webUrl'] });

const LanguageFileConnection = Connection.define(Language, File);

export default LanguageFileConnection;
