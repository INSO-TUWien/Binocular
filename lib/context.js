'use strict';

import express from 'express';
import cors from 'cors';
import _ from 'lodash';
import { Server } from 'socket.io';
import path from 'path';
import http from 'http';
import bodyParser from 'body-parser';
import EventEmitter from 'event-emitter';

import debug from 'debug';

const log = debug('context');

import yargs from 'yargs';
const argv = yargs();
argv
  .option('ui', {
    default: true,
    alias: 'u',
  })
  .option('open', {
    alias: 'o',
    default: true,
  })
  .option('clean', {
    default: false,
    type: 'boolean',
  })
  .option('its', {
    default: true,
    type: 'boolean',
    description: 'Enable/disable ITS indexing',
  })
  .option('ci', {
    default: true,
    type: 'boolean',
    description: 'Enable/disable CI indexing',
  })
  .option('server', {
    default: true,
    type: 'boolean',
    description: 'Enable/disable server (after indexing is finished)',
  })
  .help('h')
  .alias('help', 'h').argv;

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, { path: '/wsapi' });

const sockets = [];

io.on('connection', function (socket) {
  sockets.push(socket);
  socket.on('close', function () {
    _.remove(sockets, (s) => s === socket);
  });
});

app.use(cors());
app.use(bodyParser.json());
const context = new EventEmitter();

let quitRequested = false;

const fields = {
  app,
  argv,
  httpServer,
  targetPath: argv[0] || '.',
  models: {},
  io,
  isStopping: () => quitRequested,
  quit: () => {
    httpServer.close();
    _.each(sockets, (s) => s.disconnect());
    io.close();

    quitRequested = true;
  },
};

context.on('bound', (e) => log('Bound:', e));

_.merge(context, fields);

export default new Proxy(context, {
  set: function (obj, prop, value) {
    if (!_.includes(_.keys(EventEmitter.prototype), prop)) {
      obj[prop] = value;
      process.nextTick(function () {
        context.emit('bound', { property: prop, value: value });
        context.emit(`bound:${prop}`, value);
      });
    }

    return true;
  },
});

if (argv.ui) {
  const uiDir = path.join(__dirname, '../ui');
  const assetDir = path.join(uiDir, 'gen');
  app.use(express.static(uiDir));
  app.use('/assets', express.static(assetDir));
}
