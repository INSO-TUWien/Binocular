'use strict';

const fse = require('fs-extra');

const ctx = require('../../context.js');
const config = require('../../config.js').get();
const Db = require('./db.js');

fse.ensureDirSync(ctx.repo.pathFromRoot('.binocular'));

ctx.db = new Db(config.arango);
