'use strict';

const fs = require('fs-extra-promise');

const ctx = require('./context.js');
const config = require('./config.js').get();
const Db = require('./db.js');

fs.ensureDirSync(ctx.repo.pathFromRoot('.pupil'));

ctx.db = new Db(config.arango);
