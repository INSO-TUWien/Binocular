'use strict';

import Connection from './Connection.js';
import Language from './Language.js';
import File from './File.js';
const LanguageFileConnection = Connection.define(Language, File);

export default LanguageFileConnection;
