'use strict';

const express = require('express');
const _ = require('lodash');
const socketIo = require('socket.io');
const http = require('http');
const bodyParser = require('body-parser');
const EventEmitter = require('event-emitter');
const log = require('debug')('context');

const argv = require('yargs')
  .option('ui', {
    default: true,
    alias: 'u'
  })
  .option('open', {
    alias: 'o',
    default: true
  })
  .help('h')
  .alias('help', 'h').argv;

const app = express();
const httpServer = http.Server(app);
const io = socketIo(httpServer, { path: '/wsapi' });

app.use(bodyParser.json());

const context = new EventEmitter();

const fields = {
  app,
  argv,
  httpServer,
  targetPath: argv._[0] || '.',
  models: {},
  io
};

context.on('bound', e => log('Bound:', e));

_.merge(context, fields);

module.exports = new Proxy(context, {
  set: function(obj, prop, value) {
    if (!_.includes(_.keys(EventEmitter.prototype), prop)) {
      obj[prop] = value;
      process.nextTick(function() {
        context.emit('bound', { property: prop, value: value });
        context.emit(`bound:${prop}`, value);
      });
    }

    return true;
  }
});

if (argv.ui) {
  app.use(express.static('ui'));
  app.use('/assets', express.static('ui/gen'));
}
