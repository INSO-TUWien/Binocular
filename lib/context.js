'use strict';

const express = require('express');
const _ = require('lodash');
const socketIo = require('socket.io');
const path = require('path');
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
  .option('clean', {
    default: false,
    type: 'boolean'
  })
  .option('its', {
    default: true,
    type: 'boolean',
    description: 'Enable/disable ITS indexing'
  })
  .option('ci', {
    default: true,
    type: 'boolean',
    description: 'Enable/disable CI indexing'
  })
  .help('h')
  .alias('help', 'h').argv;

const app = express();
const httpServer = http.Server(app);
const io = socketIo(httpServer, { path: '/wsapi' });

const sockets = [];

io.on('connection', function(socket) {
  sockets.push(socket);
  socket.on('close', function() {
    _.remove(sockets, s => s === socket);
  });
});

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
  },

  quit: function() {
    httpServer.close();
    _.each(sockets, s => s.destroy());
    io.close();

    module.exports.quitRequested = true;
  }
});

if (argv.ui) {
  const uiDir = path.join(__dirname, '../ui');
  const assetDir = path.join(uiDir, 'gen');
  app.use(express.static(uiDir));
  app.use('/assets', express.static(assetDir));
}
